"use client";

import { useWallet, useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { useState, useEffect } from "react";
import idl from "./idl.json"; // You will need to copy your IDL here after build

import { getQuote, getSwapTransaction, executeSwap } from "../utils/jupiter";
import { fetchNftStats } from "../utils/metaplex";
import { txHistory } from "../utils/transactionHistory";
import { TransactionHistoryPanel } from "./TransactionHistoryPanel";
import { DiagnosticPanel } from "./DiagnosticPanel";

// --- Step 7.5: Enforce PSG1 Style ---
// Mobile-first (w-full max-w-md), Portrait layout, Large Buttons (p-4 text-xl)
export default function GameInterface() {
    const { publicKey: waPublicKey, wallet } = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();
    const [program, setProgram] = useState<Program | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [gameState, setGameState] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

    // --- Step 8.5: Metadata Explanation ---
    // We fetch metadata from the connected wallet's NFT (mocked mint for demo)
    const [equippedItem, setEquippedItem] = useState<{ name: string, atk: number, image?: string } | null>(null);

    // Initialize Anchor Program
    useEffect(() => {
        if (!anchorWallet) return;
        const provider = new AnchorProvider(connection, anchorWallet as any, AnchorProvider.defaultOptions());
        const programId = new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID ?? "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
        const prog = new Program(idl as any, programId, provider);
        setProgram(prog);
    }, [anchorWallet, connection]);

    // Mock generic NFT fetch on load for demo purposes
    // In reality, we would scan the wallet for a specific collection mint
    useEffect(() => {
        if (!connection || !anchorWallet) return;
        const demoMint = process.env.NEXT_PUBLIC_EQUIP_MINT ?? "MINT_ADDRESS_HERE";
        if (demoMint === "MINT_ADDRESS_HERE") {
            addLog("No equip mint set. Set NEXT_PUBLIC_EQUIP_MINT to auto-equip a test NFT.");
            return;
        }
        const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com";
        fetchNftStats(rpcEndpoint, demoMint).then(stats => {
            if (stats) {
                setEquippedItem(stats);
                addLog(`Loaded Item: ${stats.name}`);
            }
        });
    }, [connection, anchorWallet]);

    // Helper: Fetch player account with retry
    const fetchPlayerAccount = async (pda: web3.PublicKey, retries = 3): Promise<any> => {
        for (let i = 0; i < retries; i++) {
            try {
                if (!program) return null;
                const account = await program.account.player.fetch(pda);
                return account;
            } catch (e) {
                if (i === retries - 1) throw e;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    };

    // Helper: Wait for transaction confirmation
    const confirmTransaction = async (signature: string): Promise<boolean> => {
        try {
            const latestBlockhash = await connection.getLatestBlockhash();
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            }, 'confirmed');
            return !confirmation.value.err;
        } catch (e) {
            console.error('Confirmation error:', e);
            return false;
        }
    };

    const addLog = (msg: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    // --- Step 3.5: PDA Derivation Implementation ---
    const getPlayerPDA = async (): Promise<web3.PublicKey | null> => {
        const pubkey = anchorWallet?.publicKey;
        if (!pubkey || !program) return null;
        const [pda] = web3.PublicKey.findProgramAddressSync([
            Buffer.from("player"),
            pubkey.toBuffer(),
        ], program.programId);
        return pda;
    };

    const initPlayer = async () => {
        if (!program || !anchorWallet) {
            addLog("⚠️ Please connect wallet first");
            return;
        }
        setLoading("init");
        try {
            const pda = await getPlayerPDA();
            if (!pda) throw new Error("PDA not found");

            const baseHp = 10;
            const baseAtk = 2;
            const baseDef = 1;
            const totalAtk = baseAtk + (equippedItem ? equippedItem.atk : 0);

            addLog(`⚔️ Creating player with ATK ${totalAtk}...`);
            const tx = await program.methods
                .initPlayer(baseHp, totalAtk, baseDef)
                .accounts({
                    player: pda,
                    authority: anchorWallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            addLog(`⏳ Waiting for confirmation...`);
            const confirmed = await confirmTransaction(tx);

            if (!confirmed) {
                addLog(`⚠️ Transaction may have failed. Check Explorer.`);
            }

            // Track transaction
            txHistory.add(tx, 'init');

            addLog(`✅ Player created! TX: ${tx.slice(0, 8)}...`);
            addLog(`🔍 https://explorer.solana.com/tx/${tx}?cluster=devnet`);

            // Fetch updated state
            const account = await fetchPlayerAccount(pda);
            setGameState(account);

            // Mark as successful
            txHistory.updateStatus(tx, 'success');
            setLastRefresh(Date.now());
        } catch (e: any) {
            console.error(e);
            // Mark last transaction as failed
            const lastTx = txHistory.getAll()[0];
            if (lastTx) txHistory.updateStatus(lastTx.signature, 'failed');
            addLog(`❌ Error: ${e.message || "Init failed"}`);
        } finally {
            setLoading(null);
        }
    };

    const explore = async () => {
        if (!program || !anchorWallet) {
            addLog("⚠️ Please connect wallet and init player first");
            return;
        }
        setLoading("explore");
        try {
            addLog(`🗺️ Exploring the dungeon...`);
            const pda = await getPlayerPDA();
            const tx = await program.methods.explore()
                .accounts({ player: pda, authority: anchorWallet.publicKey })
                .rpc();

            addLog(`⏳ Confirming...`);
            await confirmTransaction(tx);

            txHistory.add(tx, 'explore');

            addLog(`✅ Encounter generated! TX: ${tx.slice(0, 8)}...`);
            addLog(`🔍 https://explorer.solana.com/tx/${tx}?cluster=devnet`);

            const account = await fetchPlayerAccount(pda);
            setGameState(account);
            txHistory.updateStatus(tx, 'success');
            setLastRefresh(Date.now());
        } catch (e: any) {
            console.error(e);
            const lastTx = txHistory.getAll()[0];
            if (lastTx) txHistory.updateStatus(lastTx.signature, 'failed');
            addLog(`❌ Error: ${e.message || "Explore failed"}`);
        } finally {
            setLoading(null);
        }
    };

    const fight = async () => {
        if (!program || !anchorWallet) {
            addLog("⚠️ Please explore first");
            return;
        }
        setLoading("fight");
        try {
            addLog(`⚔️ Engaging in battle...`);
            const pda = await getPlayerPDA();
            const tx = await program.methods.fight()
                .accounts({ player: pda, authority: anchorWallet.publicKey })
                .rpc();

            addLog(`⏳ Confirming...`);
            await confirmTransaction(tx);

            txHistory.add(tx, 'fight');

            addLog(`✅ Battle complete! TX: ${tx.slice(0, 8)}...`);
            addLog(`🔍 https://explorer.solana.com/tx/${tx}?cluster=devnet`);

            const account = await fetchPlayerAccount(pda);
            setGameState(account);
            txHistory.updateStatus(tx, 'success');
            setLastRefresh(Date.now());

            if (account.canClaim) {
                addLog(`🎁 Victory! Reward available!`);
            } else {
                addLog(`💀 Defeated. HP: ${account.hp}`);
            }
        } catch (e: any) {
            console.error(e);
            const lastTx = txHistory.getAll()[0];
            if (lastTx) txHistory.updateStatus(lastTx.signature, 'failed');
            addLog(`❌ Error: ${e.message || "Fight failed"}`);
        } finally {
            setLoading(null);
        }
    };

    const claim = async () => {
        if (!program || !anchorWallet) return;
        if (!gameState?.canClaim) {
            addLog("⚠️ No reward available. Win a battle first!");
            return;
        }
        setLoading("claim");
        try {
            addLog(`🎁 Claiming reward...`);
            const pda = await getPlayerPDA();
            const tx = await program.methods.claim()
                .accounts({ player: pda, authority: anchorWallet.publicKey })
                .rpc();

            addLog(`⏳ Confirming claim...`);
            await confirmTransaction(tx);

            txHistory.add(tx, 'claim');

            addLog(`✅ Claim TX: ${tx.slice(0, 8)}...`);

            // 2. Trigger Jupiter Swap (Note: may not work on devnet due to liquidity)
            addLog("💱 Initiating Jupiter Swap...");
            const SOL_MINT = "So11111111111111111111111111111111111111112";
            const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

            try {
                const quote = await getQuote(SOL_MINT, USDC_MINT, 1000000);
                if (!quote) throw new Error("No quote found");

                const swapTx = await getSwapTransaction(quote, anchorWallet.publicKey.toString());
                const swapTxId = await executeSwap(connection, swapTx, wallet?.adapter);

                addLog(`✅ Swap Success! TX: ${swapTxId.slice(0, 8)}...`);
                addLog(`🔍 https://explorer.solana.com/tx/${swapTxId}?cluster=devnet`);
            } catch (swapErr) {
                addLog(`⚠️ Jupiter swap unavailable on devnet (demo mode)`);
            }

            const account = await fetchPlayerAccount(pda);
            setGameState(account);
            txHistory.updateStatus(tx, 'success');
            setLastRefresh(Date.now());
        } catch (e: any) {
            console.error(e);
            const lastTx = txHistory.getAll()[0];
            if (lastTx) txHistory.updateStatus(lastTx.signature, 'failed');
            addLog(`❌ Error: ${e.message || "Claim failed"}`);
        } finally {
            setLoading(null);
        }
    };

    // Manual refresh function
    const refreshAccount = async () => {
        if (!program || !anchorWallet) {
            addLog("⚠️ Connect wallet first");
            return;
        }
        setLoading("refresh");
        try {
            addLog("🔄 Refreshing account state...");
            const pda = await getPlayerPDA();
            if (!pda) throw new Error("PDA not found");

            const account = await fetchPlayerAccount(pda);
            setGameState(account);
            setLastRefresh(Date.now());
            addLog("✅ Account refreshed!");
        } catch (e: any) {
            addLog(`❌ Refresh failed: ${e.message}`);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-mono p-4">
            <h1 className="text-2xl mb-4 text-green-400 border-b border-green-400 w-full max-w-md text-center pb-2">PROOF OF PLAY DUNGEON</h1>

            {/* Wallet Connect Button */}
            <div className="w-full max-w-md mb-4">
                <WalletMultiButton className="!bg-purple-600 !w-full !py-3 !text-lg !font-bold" />
            </div>

            {/* Status Panel */}
            <div className="w-full max-w-md border border-gray-700 p-4 mb-4">
                <h2 className="text-lg font-bold mb-2 text-yellow-400">STATUS</h2>
                <div className="text-sm space-y-1">
                    <p>HP: {gameState?.hp ?? '???'}</p>
                    <p>ATK: {gameState?.atk ?? '???'}</p>
                    <p>DEF: {gameState?.def ?? '???'}</p>
                    <p className="text-green-400">Reward: {gameState?.canClaim ? 'Available ✨' : 'None'}</p>
                    <p className="text-xs text-gray-500 mt-2">Updated: {new Date(lastRefresh).toLocaleTimeString()}</p>
                </div>
                <button
                    onClick={refreshAccount}
                    disabled={loading === "refresh"}
                    className="mt-2 w-full bg-gray-600 px-3 py-1 text-sm hover:bg-gray-500 disabled:opacity-50"
                >
                    {loading === "refresh" ? "🔄 Refreshing..." : "🔄 Refresh Account"}
                </button>
            </div>

            {/* Inventory Panel */}
            <div className="w-full max-w-md border border-gray-700 p-4 mb-4 bg-gray-900">
                <h3 className="text-sm text-gray-400 mb-2">INVENTORY (METAPLEX NFT)</h3>
                <div className="flex items-center gap-2">
                    {equippedItem ? (
                        <>
                            <span className="text-yellow-500">[{equippedItem.name}]</span>
                            <span className="text-xs text-green-300">ATK +{equippedItem.atk}</span>
                        </>
                    ) : (
                        <span className="text-gray-500">[No Item Equipped]</span>
                    )}
                </div>
            </div>

            {/* Actions - PSG1 Large Buttons */}
            <div className="grid grid-cols-1 gap-4 w-full max-w-md mb-6">
                <button
                    onClick={initPlayer}
                    disabled={loading === "init"}
                    className="bg-blue-600 p-4 text-xl font-bold uppercase tracking-widest hover:bg-blue-500 border-2 border-blue-400 disabled:opacity-50"
                >
                    {loading === "init" ? "⏳ Creating..." : "1. Init Player"}
                </button>
                <button
                    onClick={explore}
                    disabled={loading === "explore"}
                    className="bg-gray-700 p-4 text-xl font-bold uppercase tracking-widest hover:bg-gray-600 border-2 border-gray-500 disabled:opacity-50"
                >
                    {loading === "explore" ? "⏳ Exploring..." : "2. Explore (RNG)"}
                </button>
                <button
                    onClick={fight}
                    disabled={loading === "fight"}
                    className="bg-red-600 p-4 text-xl font-bold uppercase tracking-widest hover:bg-red-500 border-2 border-red-400 disabled:opacity-50"
                >
                    {loading === "fight" ? "⏳ Fighting..." : "3. Fight"}
                </button>
                <button
                    onClick={claim}
                    disabled={!gameState?.canClaim || loading === "claim"}
                    className={`p-4 text-xl font-bold uppercase tracking-widest border-2 disabled:opacity-50 ${gameState?.canClaim && loading !== "claim"
                        ? 'bg-green-600 hover:bg-green-500 border-green-400'
                        : 'bg-gray-800 border-gray-600 cursor-not-allowed'
                        }`}
                >
                    {loading === "claim" ? "⏳ Claiming..." : `4. Claim Reward ${gameState?.canClaim ? "✨" : "🔒"}`}
                </button>
            </div>

            {/* Log Panel */}
            <div className="w-full max-w-md h-48 border border-gray-700 p-2 overflow-y-auto font-mono text-xs bg-black">
                {logs.map((l, i) => (
                    <div key={i} className="mb-1 text-green-500">{">"} {l}</div>
                ))}
                <div className="text-gray-600">Waiting for command...</div>
            </div>
            {/* Real-time Diagnostics */}
            <DiagnosticPanel />

            {/* Transaction History */}
            <TransactionHistoryPanel />
        </div>
    );
}
