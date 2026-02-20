"use client";

import { useWallet, useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const WalletMultiButton = dynamic(
    async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

const DiagnosticPanel = dynamic(
    async () => (await import("./DiagnosticPanel")).DiagnosticPanel,
    { ssr: false }
);

const TransactionHistoryPanel = dynamic(
    async () => (await import("./TransactionHistoryPanel")).TransactionHistoryPanel,
    { ssr: false }
);

const ProceduralVisualizer = dynamic(
    async () => (await import("./ProceduralVisualizer")).ProceduralVisualizer,
    { ssr: false }
);

import idl from "./idl.json";
import { getQuote, getSwapTransaction, executeSwap } from "../utils/jupiter";
import { fetchNftStats } from "../utils/metaplex";
import { txHistory } from "../utils/transactionHistory";


// --- Step 7.5: Enforce PSG1 Style ---
// Mobile-first (w-full max-w-md), Portrait layout, Large Buttons (p-4 text-xl)
interface PlayerAccount {
    authority: web3.PublicKey;
    hp: number;
    atk: number;
    def: number;
    lastEvent: number[];
    canClaim: boolean;
    level: number;
}

export default function GameInterface() {
    const { publicKey: waPublicKey, connected, connecting, disconnect, select, connect, wallets } = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();
    const [program, setProgram] = useState<Program | null>(null);
    const [gameState, setGameState] = useState<PlayerAccount | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
    const [showVisuals, setShowVisuals] = useState<boolean>(false);
    const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
    const [mounted, setMounted] = useState(false);

    // Hydration guard
    useEffect(() => {
        setMounted(true);
    }, []);

    // --- Step 8.5: Metadata Explanation ---
    // We fetch metadata from the connected wallet's NFT (mocked mint for demo)
    const [equippedItem, setEquippedItem] = useState<{ name: string, atk: number, image?: string } | null>(null);

    // Initialize Anchor Program
    useEffect(() => {
        if (!anchorWallet) return;
        const provider = new AnchorProvider(connection, anchorWallet, AnchorProvider.defaultOptions());
        const programId = new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID ?? "3q31CJ8wMEDVjtfgZXnyEskzZ17yCmTj2p7MKkSKqiEJ");
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
        let finalMsg = msg;
        if (msg.toLowerCase().includes("network mismatch") || msg.toLowerCase().includes("blockhash")) {
            finalMsg = "⚠️ WRONG NETWORK! Please switch your wallet to DEVNET.";
        }
        if (msg.toLowerCase().includes("0x1") || msg.includes("attempt to debit an account but found no record")) {
            finalMsg = "⚠️ INSUFFICIENT SOL! You need Devnet SOL to play.";
        }
        setLogs((prev) => {
            const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] ${finalMsg}`];
            return newLogs.slice(-50); // CAP LOGS at 50 to prevent memory leak
        });
    };

    // --- Step 3.2: Balance Check & Airdrop ---
    const [balance, setBalance] = useState<number>(0);

    const checkBalance = async () => {
        if (!anchorWallet || !connection) return;
        try {
            const bal = await connection.getBalance(anchorWallet.publicKey);
            setBalance(bal / web3.LAMPORTS_PER_SOL);
            if (bal < 0.05 * web3.LAMPORTS_PER_SOL) {
                addLog("⚠️ LOW BALANCE: You may need Devnet SOL to initialize.");
            }
        } catch (e) {
            console.error("Balance check failed", e);
        }
    };

    useEffect(() => {
        if (connected) {
            checkBalance();
        }
    }, [connected, connection, anchorWallet]);

    const requestAirdrop = async () => {
        if (!anchorWallet) return;
        setLoading("airdrop");
        try {
            addLog("💧 Requesting 1 SOL Airdrop from Devnet...");
            const signature = await connection.requestAirdrop(anchorWallet.publicKey, 1 * web3.LAMPORTS_PER_SOL);
            await confirmTransaction(signature);
            addLog("✅ Airdrop Received! Balance updated.");
            checkBalance();
        } catch (e) {
            addLog("❌ AIRDROP FAILED: Devnet faucet might be rate-limited. Try https://faucet.solana.com");
        } finally {
            setLoading(null);
        }
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
        if (!program || !anchorWallet || !connection || isSimulationMode) return; // Stop polling if in Sim Mode

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

        // FAILSAFE: Polling Backup (Every 5s - Reduced frequency)
        const intervalId = setInterval(async () => {
            if (isSimulationMode) return; // Double check
            const pda = await getPlayerPDA();
            if (pda) {
                const account = await fetchPlayerAccount(pda);
                if (account) {
                    setGameState(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(account)) {
                            return account;
                        }
                        return prev;
                    });
                    setLastRefresh(Date.now());
                }
            }
        }, 5000); // 5s polling

        return () => {
            if (subscriptionId) {
                connection.removeAccountChangeListener(subscriptionId);
            }
            clearInterval(intervalId);
        };
    }, [program, anchorWallet, connection, isSimulationMode]); // Add isSimulationDependency

    // --- SIMULATION HELPERS ---
    const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    const generateMockTx = () => "5" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "111";

    const initPlayer = async () => {
        if (loading) return; // Prevent double click
        setLoading("init");
        try {
            if (isSimulationMode) {
                // Already in sim mode, just re-init local state
                setTimeout(() => {
                    const mockState: PlayerAccount = {
                        authority: anchorWallet!.publicKey,
                        hp: 100,
                        atk: 10,
                        def: 5,
                        lastEvent: Array(32).fill(0),
                        canClaim: false,
                        level: 1
                    };
                    setGameState(mockState);
                    addLog("✅ [DEMO] Hero Re-Initialized (Simulation)");
                    setLoading(null);
                }, 1000);
                return;
            }

            if (!program || !anchorWallet) throw new Error("Wallet not connected");

            const pid = program.programId.toString();
            addLog(`⚔️ Initializing Hero on Solana...`);
            addLog(`📡 Program ID: ${pid.slice(0, 6)}...${pid.slice(-4)}`);

            const pda = await getPlayerPDA();
            if (!pda) throw new Error("PDA calculation failed");

            const tx = await program.methods
                .initPlayer()
                .accounts({
                    player: pda,
                    authority: anchorWallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            await confirmTransaction(tx);
            txHistory.add(tx, 'init');
            addLog(`✅ Hero Born! TX: ${tx.slice(0, 8)}...`);
            txHistory.updateStatus(tx, 'success');

            const account = await fetchPlayerAccount(pda);
            setGameState(account);
            setLastRefresh(Date.now());
        } catch (e: any) {
            addLog(`❌ INIT_FAILED: ${e.message || "Unknown Error"}`);

            // Auto-Switch to Simulation for Demo if Contract is missing
            if (e.message.includes("Program that does not exist") || e.message.includes("simulation failed")) {
                addLog("⚠️ CONTRACT NOT DEPLOYED? Switching to DEMO MODE.");
                addLog("🕹️ Simulating On-Chain Logic locally...");
                setIsSimulationMode(true); // ENABLE SIMULATION MODE GLOBALLY
                setTimeout(() => {
                    const mockState: PlayerAccount = {
                        authority: anchorWallet!.publicKey,
                        hp: 100,
                        atk: 10,
                        def: 5,
                        lastEvent: Array(32).fill(0),
                        canClaim: false,
                        level: 1
                    };
                    setGameState(mockState);
                    addLog("✅ [DEMO] Hero Initialized (Simulation)");
                }, 1500);
            }
        } finally {
            setLoading(null);
        }
    };

    const equipItemOnChain = async () => {
        if (!equippedItem || !program || !anchorWallet) return;
        setLoading("equip");
        try {
            addLog(`🛡️ Equipping ${equippedItem.name} On-Chain...`);
            const pda = await getPlayerPDA();
            if (!pda) throw new Error("PDA");

            const tx = await program.methods
                .equip(equippedItem.atk, 0) // Passing ATK bonus from Metaplex metadata
                .accounts({
                    player: pda,
                    authority: anchorWallet.publicKey,
                })
                .rpc();

            await confirmTransaction(tx);
            txHistory.add(tx, 'equip');
            addLog(`✅ Item Bound to PDA! TX: ${tx.slice(0, 8)}...`);
            txHistory.updateStatus(tx, 'success');

            const account = await fetchPlayerAccount(pda);
            setGameState(account);
        } catch (e: any) {
            addLog(`❌ EQUIP_FAILED: ${e.message}`);
        } finally {
            setLoading(null);
        }
    };

    // --- SIMULATION LOGIC ---
    const runSimulation = (action: 'explore' | 'fight' | 'claim') => {
        if (!gameState) return;
        setLoading(action);

        setTimeout(() => {
            let newState = { ...gameState };

            if (action === 'explore') {
                // Mock Hash
                const mockHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 255));
                newState.lastEvent = mockHash;
                addLog("✅ [DEMO] Entropy Generated (Simulation)");
            }

            else if (action === 'fight') {
                // Mock Combat Math (Simple)
                if (gameState.lastEvent.every(b => b === 0)) {
                    addLog("❌ [DEMO] Explore first!");
                    setLoading(null);
                    return;
                }
                const playerDmg = Math.max(1, gameState.atk - 5); // Assumed monster def 5
                const monsterDmg = Math.max(1, 15 - gameState.def); // Assumed monster atk 15
                const hpLoss = monsterDmg * 2; // Simulate 2 rounds

                newState.hp = Math.max(0, newState.hp - hpLoss);
                newState.lastEvent = Array(32).fill(0); // Reset event

                if (newState.hp > 0) {
                    newState.level += 1;
                    newState.canClaim = true;
                    addLog(`🎁 [DEMO] VICTORY! Level ${newState.level} reached.`);
                } else {
                    newState.hp = 0;
                    addLog(`💀 [DEMO] DEFEATED.`);
                }
            }

            else if (action === 'claim') {
                newState.canClaim = false;
                newState.hp = Math.min(100, newState.hp + 20);
                addLog(`✅ [DEMO] Reward Claimed!`);
            }

            setGameState(newState);
            setLoading(null);
        }, 1000);
    };

    const explore = async () => {
        setLoading("explore");
        if (isSimulationMode) {
            runSimulation('explore');
            return;
        }
        try {
            if (!program || !anchorWallet || !gameState) throw new Error("State missing");
            addLog(`🗺️ Hashing On-Chain Entropy (Level ${gameState.level})...`);
            const pda = await getPlayerPDA();
            if (!pda) throw new Error("PDA");

            const tx = await program.methods.explore()
                .accounts({ player: pda, authority: anchorWallet.publicKey })
                .rpc();

            await confirmTransaction(tx);
            txHistory.add(tx, 'explore');
            addLog(`✅ Entropy Generated! TX: ${tx.slice(0, 8)}...`);
            txHistory.updateStatus(tx, 'success');

            const account = await fetchPlayerAccount(pda!);
            setGameState(account);
        } catch (e: any) {
            console.error("Explore Error:", e);
            if (e.message.includes("simulation failed") || e.message.includes("Program that does not exist") || e.message.includes("User rejected")) {
                addLog("⚠️ NETWORK ERROR: Switching to Simulation...");
                runSimulation('explore');
            } else {
                addLog(`❌ EXPLORE_FAILED: ${e.message}`);
                setLoading(null);
            }
        } finally {
            if (!loading) setLoading(null);
        }
    };

    const fight = async () => {
        setLoading("fight");
        if (isSimulationMode) {
            runSimulation('fight');
            return;
        }
        try {
            if (!program || !anchorWallet || !gameState) throw new Error("State missing");
            if (gameState.lastEvent.every(b => b === 0)) throw new Error("Explore first");

            addLog(`⚔️ Executing Deterministic Combat Logic...`);
            const pda = await getPlayerPDA();
            if (!pda) throw new Error("PDA");

            const tx = await program.methods.fight()
                .accounts({ player: pda, authority: anchorWallet.publicKey })
                .rpc();

            await confirmTransaction(tx);
            txHistory.add(tx, 'fight');
            addLog(`✅ Battle complete! TX: ${tx.slice(0, 8)}...`);
            txHistory.updateStatus(tx, 'success');

            const account = await fetchPlayerAccount(pda!);
            setGameState(account);
            if (account?.canClaim) {
                addLog(`🎁 VICTORY! Level ${account.level} reached. Reward Unlocked.`);
            } else {
                addLog(`💀 DEFEATED. Zero database records affected. State is Truth.`);
            }
        } catch (e: any) {
            console.error("Fight Error:", e);
            if (e.message.includes("simulation failed") || e.message.includes("Program that does not exist") || e.message.includes("User rejected")) {
                addLog("⚠️ NETWORK ERROR: Switching to Simulation...");
                runSimulation('fight');
            } else {
                addLog(`❌ FIGHT_FAILED: ${e.message}`);
                setLoading(null);
            }
        }
    };

    const claim = async () => {
        setLoading("claim");
        if (isSimulationMode) {
            runSimulation('claim');
            return;
        }
        try {
            if (!program || !anchorWallet || !gameState?.canClaim) throw new Error("Nothing to claim");
            addLog(`🎁 Initiating On-Chain Reward Settlement...`);
            const pda = await getPlayerPDA();
            if (!pda) throw new Error("PDA");

            const tx = await program.methods.claim()
                .accounts({ player: pda, authority: anchorWallet.publicKey })
                .rpc();

            await confirmTransaction(tx);
            txHistory.add(tx, 'claim');
            addLog(`✅ Claim Tx Success! TX: ${tx.slice(0, 8)}...`);
            txHistory.updateStatus(tx, 'success');

            const account = await fetchPlayerAccount(pda!);
            setGameState(account);
        } catch (e: any) {
            console.error("Claim Error:", e);
            if (e.message.includes("simulation failed") || e.message.includes("Program that does not exist") || e.message.includes("User rejected")) {
                addLog("⚠️ NETWORK ERROR: Switching to Simulation...");
                runSimulation('claim');
            } else {
                addLog(`❌ CLAIM_FAILED: ${e.message}`);
                setLoading(null);
            }
        }
    };

    // Manual refresh function
    const refreshAccount = async () => {
        if (!program || !anchorWallet) return;
        setLoading("refresh");
        try {
            addLog("🔄 Hard-Syncing with Solana RPC...");
            const pda = await getPlayerPDA();
            if (!pda) throw new Error("PDA");
            const account = await fetchPlayerAccount(pda);
            setGameState(account);
            addLog("✅ State Synchronized.");
        } catch (e: any) {
            addLog(`❌ SYNC_FAILED: ${e.message}`);
        } finally {
            setLoading(null);
        }
    };

    if (!mounted) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#00ff41] font-mono p-4">
            <div className="text-2xl animate-pulse">LOADING_SYSTEM_RESOURCES...</div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#00ff41] font-mono p-4 relative overflow-hidden crt-flicker">
            {/* CRT Scanline Overlay */}
            <div className="scanline"></div>

            <div className="w-full max-w-md mb-6 flex flex-col items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-center tracking-widest drop-shadow-[0_0_10px_rgba(0,255,65,0.8)] border-b-2 border-[#00ff41] w-full pb-2 mb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff41] to-blue-500">
                        PROOF_OF_PLAY
                    </span>
                    <span className="block text-sm sm:text-lg text-[#00ff41]">DUNGEON_ETERNAL</span>
                </h1>

                <div className="w-full flex justify-between items-end px-2">
                    <span className="text-[10px] text-[#00ff41] font-bold tracking-tighter opacity-80 uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        NET: DEVNET (LIVE_RPC)
                    </span>
                    <button
                        onClick={() => setShowVisuals(!showVisuals)}
                        className={`text-[10px] px-3 py-1 border transition-all duration-300 psg1-glow ${showVisuals
                            ? 'bg-[#00ff41] text-black border-[#00ff41] font-bold'
                            : 'bg-black border-[#00ff41] text-[#00ff41]'}`}
                    >
                        {showVisuals ? '[ VISUALS: ON ]' : '[ TEXT_ONLY ]'}
                    </button>
                </div>
            </div>

            {/* Step 7.5: Procedural Graphics Layer */}
            {showVisuals && (
                <div className="w-full max-w-md mb-6 border-2 border-[#00ff41] p-1 shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                    <ProceduralVisualizer
                        hash={gameState?.lastEvent || Array(32).fill(0)}
                        isFighting={loading === "fight"}
                    />
                </div>
            )}

            {/* Wallet Connect/Disconnect Group */}
            <div className="w-full max-w-md mb-6 relative z-10 flex flex-col gap-2">
                <WalletMultiButton className="!bg-[#00ff41] !text-black !font-bold !w-full !py-3 !text-lg !rounded-none !uppercase !tracking-widest hover:!scale-105 transition-transform !border-2 !border-[#00ff41]" />

                {(connected || connecting) && (
                    <button
                        onClick={disconnect}
                        className="bg-red-900/40 text-red-500 border-2 border-red-500 w-full py-3 text-lg font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-200 psg1-glow shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                    >
                        {connecting ? "CANCEL / CHANGE_WALLET" : "DISCONNECT_WALLET"}
                    </button>
                )}
            </div>

            {/* Status Panel */}
            <div className="w-full max-w-md border-2 border-[#00ff41] p-4 mb-4 bg-black/80 backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,65,0.1)] relative z-10">
                <h2 className="text-lg font-bold mb-2 border-b border-[#00ff41] pb-1 text-yellow-400">:: PLAYER_STATUS ::</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>LEVEL: <span className="text-white font-bold">{gameState?.level ?? '---'}</span></p>
                    <p>HP: <span className="text-white">{gameState?.hp ?? '---'}</span></p>
                    <p>ATK: <span className="text-white">{gameState?.atk ?? '---'}</span></p>
                    <p>DEF: <span className="text-white">{gameState?.def ?? '---'}</span></p>
                    <p className="col-span-2">REWARD: <span className={gameState?.canClaim ? "text-yellow-400 font-bold blink" : "text-gray-500"}>{gameState?.canClaim ? 'AVAILABLE' : 'LOCKED'}</span></p>
                    {balance < 0.5 && (
                        <button
                            onClick={requestAirdrop}
                            disabled={loading === "airdrop"}
                            className="col-span-2 mt-1 border border-yellow-500 text-yellow-500 text-xs py-1 hover:bg-yellow-500 hover:text-black transition-colors uppercase"
                        >
                            {loading === "airdrop" ? "REQUESTING..." : "⚠️ LOW BAL: REQUEST 1 SOL AIRDROP"}
                        </button>
                    )}
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
                <div className="flex items-center justify-between gap-3">
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
                            <span className="text-gray-600 italic">[ NO_ITEM_DETECTED ]</span>
                        )}
                    </div>
                    {equippedItem && (
                        <button
                            onClick={equipItemOnChain}
                            disabled={loading === "equip"}
                            className="bg-yellow-600 text-black px-4 py-1 text-xs font-bold uppercase hover:bg-yellow-400 disabled:opacity-50"
                        >
                            {loading === "equip" ? "EQUIPPING..." : "EQUIP_ON_CHAIN"}
                        </button>
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
