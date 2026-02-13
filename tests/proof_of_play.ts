import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProofOfPlay } from "../target/types/proof_of_play";
import { expect } from "chai";

describe("proof_of_play", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.ProofOfPlay as Program<ProofOfPlay>;

    // Test wallet
    const player = anchor.web3.Keypair.generate();
    let playerPDA: anchor.web3.PublicKey;
    let playerBump: number;

    before(async () => {
        // Airdrop SOL to test wallet
        const signature = await provider.connection.requestAirdrop(
            player.publicKey,
            2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(signature);

        // Derive PDA
        [playerPDA, playerBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("player"), player.publicKey.toBuffer()],
            program.programId
        );
    });

    it("Initializes a player with valid stats", async () => {
        const hp = 10;
        const atk = 5;
        const def = 2;

        await program.methods
            .initPlayer(hp, atk, def)
            .accounts({
                player: playerPDA,
                authority: player.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([player])
            .rpc();

        const account = await program.account.player.fetch(playerPDA);

        expect(account.authority.toString()).to.equal(player.publicKey.toString());
        expect(account.hp).to.equal(hp);
        expect(account.atk).to.equal(atk);
        expect(account.def).to.equal(def);
        expect(account.canClaim).to.equal(false);
    });

    it("Rejects invalid stats - HP too high", async () => {
        const newPlayer = anchor.web3.Keypair.generate();
        const [newPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("player"), newPlayer.publicKey.toBuffer()],
            program.programId
        );

        // Airdrop for new player
        const sig = await provider.connection.requestAirdrop(
            newPlayer.publicKey,
            anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig);

        try {
            await program.methods
                .initPlayer(150, 5, 2) // HP > 100
                .accounts({
                    player: newPDA,
                    authority: newPlayer.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([newPlayer])
                .rpc();

            expect.fail("Should have thrown error for invalid HP");
        } catch (err) {
            expect(err.toString()).to.include("InvalidStats");
        }
    });

    it("Rejects invalid stats - ATK too high", async () => {
        const newPlayer = anchor.web3.Keypair.generate();
        const [newPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("player"), newPlayer.publicKey.toBuffer()],
            program.programId
        );

        const sig = await provider.connection.requestAirdrop(
            newPlayer.publicKey,
            anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig);

        try {
            await program.methods
                .initPlayer(10, 100, 2) // ATK > 50
                .accounts({
                    player: newPDA,
                    authority: newPlayer.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([newPlayer])
                .rpc();

            expect.fail("Should have thrown error for invalid ATK");
        } catch (err) {
            expect(err.toString()).to.include("InvalidStats");
        }
    });

    it("Allows player to explore and generates random event", async () => {
        await program.methods
            .explore()
            .accounts({
                player: playerPDA,
                authority: player.publicKey,
            })
            .signers([player])
            .rpc();

        const account = await program.account.player.fetch(playerPDA);

        // Event hash should no longer be all zeros
        const isAllZeros = account.lastEvent.every((byte: number) => byte === 0);
        expect(isAllZeros).to.equal(false);
    });

    it("Allows player to fight after exploring", async () => {
        await program.methods
            .fight()
            .accounts({
                player: playerPDA,
                authority: player.publicKey,
            })
            .signers([player])
            .rpc();

        const account = await program.account.player.fetch(playerPDA);

        // Event should be cleared after fight (anti-replay)
        const isAllZeros = account.lastEvent.every((byte: number) => byte === 0);
        expect(isAllZeros).to.equal(true);

        // Player should either have reward or reduced HP
        expect(account.canClaim === true || account.hp < 10).to.equal(true);
    });

    it("Rejects fight without exploring first", async () => {
        // Player already fought, so event is cleared
        try {
            await program.methods
                .fight()
                .accounts({
                    player: playerPDA,
                    authority: player.publicKey,
                })
                .signers([player])
                .rpc();

            expect.fail("Should have thrown error for no event");
        } catch (err) {
            expect(err.toString()).to.include("NoEvent");
        }
    });

    it("Allows claim only if player won", async () => {
        const account = await program.account.player.fetch(playerPDA);

        if (account.canClaim) {
            // Player won, claim should work
            await program.methods
                .claim()
                .accounts({
                    player: playerPDA,
                    authority: player.publicKey,
                })
                .signers([player])
                .rpc();

            const updatedAccount = await program.account.player.fetch(playerPDA);
            expect(updatedAccount.canClaim).to.equal(false);
        } else {
            // Player lost or hasn't won, claim should fail
            try {
                await program.methods
                    .claim()
                    .accounts({
                        player: playerPDA,
                        authority: player.publicKey,
                    })
                    .signers([player])
                    .rpc();

                expect.fail("Should have thrown error for nothing to claim");
            } catch (err) {
                expect(err.toString()).to.include("NothingToClaim");
            }
        }
    });

    it("Prevents unauthorized access to player account", async () => {
        const hacker = anchor.web3.Keypair.generate();

        // Airdrop to hacker
        const sig = await provider.connection.requestAirdrop(
            hacker.publicKey,
            anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig);

        try {
            // Hacker tries to explore with someone else's account
            await program.methods
                .explore()
                .accounts({
                    player: playerPDA, // Original player's PDA
                    authority: hacker.publicKey, // Hacker's key
                })
                .signers([hacker])
                .rpc();

            expect.fail("Should have thrown error for unauthorized access");
        } catch (err) {
            expect(err.toString()).to.include("Unauthorized");
        }
    });

    it("Full game loop test: init -> explore -> fight -> claim", async () => {
        const testPlayer = anchor.web3.Keypair.generate();
        const [testPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("player"), testPlayer.publicKey.toBuffer()],
            program.programId
        );

        // Airdrop
        const sig = await provider.connection.requestAirdrop(
            testPlayer.publicKey,
            2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig);

        // 1. Init with high stats to ensure win
        await program.methods
            .initPlayer(100, 50, 20)
            .accounts({
                player: testPDA,
                authority: testPlayer.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([testPlayer])
            .rpc();

        // 2. Explore
        await program.methods
            .explore()
            .accounts({
                player: testPDA,
                authority: testPlayer.publicKey,
            })
            .signers([testPlayer])
            .rpc();

        // 3. Fight (should win with max stats)
        await program.methods
            .fight()
            .accounts({
                player: testPDA,
                authority: testPlayer.publicKey,
            })
            .signers([testPlayer])
            .rpc();

        let account = await program.account.player.fetch(testPDA);
        expect(account.canClaim).to.equal(true);

        // 4. Claim
        await program.methods
            .claim()
            .accounts({
                player: testPDA,
                authority: testPlayer.publicKey,
            })
            .signers([testPlayer])
            .rpc();

        account = await program.account.player.fetch(testPDA);
        expect(account.canClaim).to.equal(false);
    });
});
