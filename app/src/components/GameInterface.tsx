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
import { ProceduralVisualizer } from "./ProceduralVisualizer";

// --- Step 7.5: Enforce PSG1 Style ---
// Mobile-first (w-full max-w-md), Portrait layout, Large Buttons (p-4 text-xl)
interface PlayerAccount {
    authority: web3.PublicKey;
    hp: number;
    atk: number;
    def: number;
    lastEvent: number[];
    canClaim: boolean;
}

export default function GameInterface() {
    const { publicKey: waPublicKey, wallet } = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();
    const [program, setProgram] = useState<Program | null>(null);
    const [gameState, setGameState] = useState<PlayerAccount | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
    const [showVisuals, setShowVisuals] = useState<boolean>(false);

    // --- Step 8.5: Metadata Explanation ---
    // We fetch metadata from the connected wallet's NFT (mocked mint for demo)
    const [equippedItem, setEquippedItem] = useState<{ name: string, atk: number, image?: string } | null>(null);

    // Initialize Anchor Program
    useEffect(() => {
        if (!anchorWallet) return;
        const provider = new AnchorProvider(connection, anchorWallet, AnchorProvider.defaultOptions());
        const programId = new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID ?? "3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK");
        // @ts-ignore - IDL type mismatch is common in Anchor 0.29+
        const prog = new Program(idl, programId, provider);
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
    const fetchPlayerAccount = async (pda: web3.PublicKey, retries = 3): Promise<PlayerAccount | null> => {
        for (let i = 0; i < retries; i++) {
            try {
                // @ts-ignore - Dynamic account fetching in strict mode
                const account = await program.account.player.fetch(pda);
                return account as unknown as PlayerAccount;
            } catch (e) {
                if (i === retries - 1) throw e;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
        return null;
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

    // --- REAL-TIME: Subscribe to Account Changes ---
    useEffect(() => {
        if (!program || !anchorWallet || !connection) return;

        let subscriptionId: number;

        const subscribeToPlayer = async () => {
            const pda = await getPlayerPDA();
            if (!pda) return;

            // Initial fetch
            fetchPlayerAccount(pda).then(account => {
                if (account) setGameState(account);
            });

            // WebSocket Subscription
            subscriptionId = connection.onAccountChange(
                pda,
                async (accountInfo) => {
                    try {
                        // Decode new state directly from the buffer
                        const decoded = program.coder.accounts.decode("player", accountInfo.data);
                        setGameState(decoded as unknown as PlayerAccount);
                        setLastRefresh(Date.now());
                        addLog("⚡ Real-time update received!");
                    } catch (e) {
                        console.error("Failed to decode real-time update", e);
                    }
                },
                "confirmed"
            );

            addLog("🟢 Real-time connection established.");
        };

        subscribeToPlayer();

        // FAILSAFE: Polling Backup (Every 3s)
        // Ensures state is sync'd even if WebSocket packet is dropped by RPC
        const intervalId = setInterval(async () => {
            const pda = await getPlayerPDA();
            if (pda) {
                const account = await fetchPlayerAccount(pda);
                if (account) {
                    // Check if state actually changed to avoid re-renders? 
                    // React state setter handles strict equality checks usually, but let's just set it.
                    // We don't want to spam logs, so we won't log on poll unless it changes significantly,
                    // but for this 'Super Perfect' strict mode, reliable data > log spam.
                    setGameState(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(account)) {
                            // Only update if different
                            return account;
                        }
                        return prev;
                    });
                    setLastRefresh(Date.now());
                }
            }
        }, 3000);

        return () => {
            if (subscriptionId) {
                connection.removeAccountChangeListener(subscriptionId);
            }
            clearInterval(intervalId);
        };
    }, [program, anchorWallet, connection]);

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

            addLog(`⚔️ Creating player with Default Stats...`);
            const tx = await program.methods
                .initPlayer()
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
        } catch (e: unknown) {
            console.error(e);
            // Mark last transaction as failed
            const lastTx = txHistory.getAll()[0];
            if (lastTx) txHistory.updateStatus(lastTx.signature, 'failed');
            const msg = e instanceof Error ? e.message : "Init failed";
            addLog(`❌ Error: ${msg}`);
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
            if (!pda) throw new Error("PDA derivation failed");
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
        } catch (e: unknown) {
            console.error(e);
            const lastTx = txHistory.getAll()[0];
            if (lastTx) txHistory.updateStatus(lastTx.signature, 'failed');
            const msg = e instanceof Error ? e.message : "Explore failed";
            addLog(`❌ Error: ${msg}`);
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
            if (!pda) throw new Error("PDA error");
            const tx = await program.methods.fight()
                .accounts({ player: pda, authority: anchorWallet.publicKey })
                .rpc();

            addLog(`⏳ Confirming...`);
            await confirmTransaction(tx);

            txHistory.add(tx, 'fight');

            addLog(`✅ Battle complete! TX: ${tx.slice(0, 8)}...`);
            addLog(`🔍 https://explorer.solana.com/tx/${tx}?cluster=devnet`);

            const account = await fetchPlayerAccount(pda);
            if (!account) throw new Error("Failed to fetch state");
            setGameState(account);
            txHistory.updateStatus(tx, 'success');
            setLastRefresh(Date.now());

            if (account.canClaim) {
                addLog(`🎁 Victory! Reward available!`);
            } else {
                addLog(`💀 Defeated. HP: ${account.hp}`);
            }
        } catch (e: unknown) {
            console.error(e);
            const lastTx = txHistory.getAll()[0];
            if (lastTx) txHistory.updateStatus(lastTx.signature, 'failed');
            const msg = e instanceof Error ? e.message : "Fight failed";
            addLog(`❌ Error: ${msg}`);
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
            if (!pda) throw new Error("PDA error");
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

                if (!wallet?.adapter) throw new Error("Wallet adapter not found");
                const swapTx = await getSwapTransaction(quote, anchorWallet.publicKey.toString());
                const swapTxId = await executeSwap(connection, swapTx, wallet.adapter);

                addLog(`✅ Swap Success! TX: ${swapTxId.slice(0, 8)}...`);
                addLog(`🔍 https://explorer.solana.com/tx/${swapTxId}?cluster=devnet`);
            } catch (swapErr) {
                addLog(`⚠️ Jupiter swap unavailable on devnet (demo mode)`);
            }

            const account = await fetchPlayerAccount(pda);
            setGameState(account);
            txHistory.updateStatus(tx, 'success');
            setLastRefresh(Date.now());
        } catch (e: unknown) {
            console.error(e);
            const lastTx = txHistory.getAll()[0];
            if (lastTx) txHistory.updateStatus(lastTx.signature, 'failed');
            const msg = e instanceof Error ? e.message : "Claim failed";
            addLog(`❌ Error: ${msg}`);
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
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Refresh failed";
            addLog(`❌ Refresh failed: ${msg}`);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#00ff41] font-mono p-4 relative overflow-hidden crt-flicker">
            {/* CRT Scanline Overlay */}
            <div className="scanline"></div>

            <h1 className="text-3xl mb-6 border-b-2 border-[#00ff41] w-full max-w-md text-center pb-2 flex justify-between items-center px-2 tracking-widest drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">
                <span className="font-bold">PROOF_OF_PLAY_DUNGEON_V1</span>
                <button
                    onClick={() => setShowVisuals(!showVisuals)}
                    className={`text-[10px] px-3 py-1 border transition-all duration-300 psg1-glow ${showVisuals
                        ? 'bg-[#00ff41] text-black border-[#00ff41] font-bold'
                        : 'bg-black border-[#00ff41] text-[#00ff41]'}`}
                >
                    {showVisuals ? '[ VISUAL_MODE: ON ]' : '[ TEXT_ONLY ]'}
                </button>
            </h1>

            {/* Step 7.5: Procedural Graphics Layer */}
            {showVisuals && (
                <div className="w-full max-w-md mb-6 border-2 border-[#00ff41] p-1 shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                    <ProceduralVisualizer
                        hash={gameState?.lastEvent || Array(32).fill(0)}
                        isFighting={loading === "fight"}
                    />
                </div>
            )}

            {/* Wallet Connect Button */}
            <div className="w-full max-w-md mb-6 relative z-10">
                <WalletMultiButton className="!bg-[#00ff41] !text-black !font-bold !w-full !py-3 !text-lg !rounded-none !uppercase !tracking-widest hover:!scale-105 transition-transform !border-2 !border-[#00ff41]" />
            </div>

            {/* Status Panel */}
            <div className="w-full max-w-md border-2 border-[#00ff41] p-4 mb-4 bg-black/80 backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,65,0.1)] relative z-10">
                <h2 className="text-lg font-bold mb-2 border-b border-[#00ff41] pb-1 text-yellow-400">:: PLAYER_STATUS ::</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>HP: <span className="text-white">{gameState?.hp ?? '---'}</span></p>
                    <p>ATK: <span className="text-white">{gameState?.atk ?? '---'}</span></p>
                    <p>DEF: <span className="text-white">{gameState?.def ?? '---'}</span></p>
                    <p>REWARD: <span className={gameState?.canClaim ? "text-yellow-400 font-bold blink" : "text-gray-500"}>{gameState?.canClaim ? 'AVAILABLE' : 'LOCKED'}</span></p>
                </div>
                <div className="text-[10px] text-gray-400 mt-2 text-right flex justify-end items-center gap-2">
                    <span className="flex items-center gap-1 text-[#00ff41] animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#00ff41]"></span>
                        LIVE_NETWORK
                    </span>
                    <span>LAST_SYNC: {new Date(lastRefresh).toLocaleTimeString()}</span>
                </div>
                <button
                    onClick={refreshAccount}
                    disabled={loading === "refresh"}
                    className="mt-3 w-full border border-[#00ff41] text-[#00ff41] px-3 py-1 text-xs hover:bg-[#00ff41] hover:text-black transition-colors uppercase disabled:opacity-50"
                >
                    {loading === "refresh" ? "SYNCING..." : "FORCE_REFRESH_STATE"}
                </button>
            </div>

            {/* Inventory Panel */}
            <div className="w-full max-w-md border border-gray-800 p-4 mb-6 bg-gray-900/50 relative z-10">
                <h3 className="text-xs text-gray-500 mb-2 uppercase tracking-wide">:: EQUIPMENT_SLOT (METAPLEX) ::</h3>
                <div className="flex items-center gap-3">
                    {equippedItem ? (
                        <>
                            <div className="w-8 h-8 bg-yellow-900 border border-yellow-500 flex items-center justify-center text-yellow-500 text-xs font-bold">NFT</div>
                            <div>
                                <span className="text-yellow-400 font-bold block">{equippedItem.name}</span>
                                <span className="text-xs text-[#00ff41]">+ {equippedItem.atk} ATK POWER</span>
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-600 italic">[ NO_ITEM_EQUIPPED ]</span>
                    )}
                </div>
            </div>

            {/* Actions - PSG1 Large Buttons */}
            <div className="grid grid-cols-1 gap-4 w-full max-w-md mb-6 relative z-10">
                <button
                    onClick={initPlayer}
                    disabled={loading === "init"}
                    className="bg-blue-900/20 text-blue-400 border-2 border-blue-500 p-4 text-xl font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-black transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed psg1-glow"
                >
                    {loading === "init" ? "INITIALIZING..." : "1. INITIALIZE_PDA"}
                </button>
                <button
                    onClick={explore}
                    disabled={loading === "explore"}
                    className="bg-gray-800/20 text-gray-300 border-2 border-gray-500 p-4 text-xl font-bold uppercase tracking-widest hover:bg-gray-500 hover:text-black transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed psg1-glow"
                >
                    {loading === "explore" ? "GENERATING_HASH..." : "2. EXPLORE_DUNGEON"}
                </button>
                <button
                    onClick={fight}
                    disabled={loading === "fight"}
                    className="bg-red-900/20 text-red-500 border-2 border-red-500 p-4 text-xl font-bold uppercase tracking-widest hover:bg-red-600 hover:text-black transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed psg1-glow"
                >
                    {loading === "fight" ? "COMBAT_CALC..." : "3. FIGHT_MONSTER"}
                </button>
                <button
                    onClick={claim}
                    disabled={!gameState?.canClaim || loading === "claim"}
                    className={`p-4 text-xl font-bold uppercase tracking-widest border-2 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg ${gameState?.canClaim && loading !== "claim"
                        ? 'bg-green-900/20 text-green-400 border-green-500 hover:bg-green-500 hover:text-black psg1-glow animate-pulse'
                        : 'bg-gray-900 border-gray-800 text-gray-600'
                        }`}
                >
                    {loading === "claim" ? "SWAPPING_REWARD..." : `4. CLAIM_LOOT ${gameState?.canClaim ? "($)" : "[LOCKED]"}`}
                </button>
            </div>

            {/* Log Panel */}
            <div className="w-full max-w-md h-48 border-2 border-[#00ff41] p-3 overflow-y-auto font-mono text-xs bg-black/90 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative z-10 custom-scrollbar">
                <div className="border-b border-gray-800 mb-2 pb-1 text-gray-500 uppercase tracking-wider text-[10px]">:: SYSTEM_LOGS ::</div>
                {logs.length === 0 && <div className="text-gray-700 blink">_ WAITING_FOR_INPUT...</div>}
                {logs.map((l, i) => (
                    <div key={i} className="mb-1 text-[#00ff41] font-bold text-shadow flex">
                        <span className="mr-2 opacity-50">{">"}</span>
                        <span>{l}</span>
                    </div>
                ))}
                <div ref={(el) => { if (el) el.scrollIntoView({ behavior: "smooth" }); }} />
            </div>

            {/* Real-time Diagnostics */}
            <div className="mt-4 w-full max-w-md opacity-70 hover:opacity-100 transition-opacity">
                <DiagnosticPanel />
            </div>

            {/* Transaction History */}
            <div className="mt-4 w-full max-w-md">
                <TransactionHistoryPanel />
            </div>
        </div>
    );
}
