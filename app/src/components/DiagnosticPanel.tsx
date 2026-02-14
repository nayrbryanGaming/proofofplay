
import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { performHealthCheck, testRPCEndpoints, HealthCheckResult } from '../utils/diagnostics';

export const DiagnosticPanel = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [health, setHealth] = useState<HealthCheckResult | null>(null);
    const [rpcStats, setRpcStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        try {
            // Get program ID from env
            const programIdStr = process.env.NEXT_PUBLIC_PROGRAM_ID;
            let programId: PublicKey;
            try {
                programId = new PublicKey(programIdStr || "11111111111111111111111111111111");
            } catch {
                programId = PublicKey.default;
            }

            // Run checks
            const [healthResult, rpcResult] = await Promise.all([
                performHealthCheck(connection, programId, publicKey),
                testRPCEndpoints()
            ]);

            setHealth(healthResult);
            setRpcStats(rpcResult);
        } catch (e) {
            console.error("Diagnostic failed", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            runDiagnostics();
        }
    }, [isOpen, connection, publicKey]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-black border border-[#00ff41] text-[#00ff41] p-2 rounded-none hover:bg-[#00ff41] hover:text-black transition-colors z-50 text-xs font-mono tracking-wider psg1-glow"
                title="System Diagnostics"
            >
                [ SYSTEM_DIAG ]
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-black/90 border-2 border-[#00ff41] p-4 shadow-[0_0_20px_rgba(0,255,65,0.2)] z-50 text-xs font-mono text-[#00ff41] backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4 border-b border-[#00ff41] pb-2">
                <h3 className="font-bold flex items-center tracking-widest">
                    <span className="animate-pulse mr-2 text-[#00ff41]">■</span>
                    SYSTEM_STATUS
                </h3>
                <div className="flex gap-2">
                    <button onClick={runDiagnostics} className="hover:text-white hover:bg-[#00ff41] px-1" disabled={loading}>
                        {loading ? "..." : "[R]"}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:text-white hover:bg-[#00ff41] px-1">[X]</button>
                </div>
            </div>

            {loading && !health ? (
                <div className="text-center py-4 animate-pulse">ANALYZING_NETWORK...</div>
            ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {/* Overall Status */}
                    <div className={`text-center p-2 border ${health?.status === 'healthy' ? 'border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10' :
                        health?.status === 'warning' ? 'border-yellow-500 text-yellow-500 bg-yellow-900/20' :
                            'border-red-500 text-red-500 bg-red-900/20'
                        }`}>
                        STATUS: {health?.status?.toUpperCase() || "UNKNOWN"}
                    </div>

                    {/* Component Checks */}
                    <div className="space-y-1">
                        <div className="flex justify-between border-b border-gray-800 pb-1">
                            <span>RPC_CONN</span>
                            <span>{health?.checks.rpc ? "OK" : "ERR"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-1">
                            <span>PROG_ID</span>
                            <span>{health?.checks.program ? "OK" : "ERR"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-1">
                            <span>SOL_BAL</span>
                            <span>{health?.checks.balance !== null ? health?.checks.balance.toFixed(4) : "--"}</span>
                        </div>
                    </div>

                    {/* Messages */}
                    {health?.messages && health.messages.length > 0 && (
                        <div className="border-t border-[#00ff41] pt-2 text-[#00ff41]/70">
                            {health.messages.map((msg, i) => (
                                <div key={i} className="truncate">&gt; {msg}</div>
                            ))}
                        </div>
                    )}

                    {/* RPC Latency */}
                    <div className="border-t border-[#00ff41] pt-2">
                        <div className="mb-1 font-bold text-[#00ff41]/50">RPC_LATENCY_MS</div>
                        {rpcStats.map((stat, i) => (
                            <div key={i} className="flex justify-between text-[#00ff41]/70">
                                <span className="truncate w-24">{new URL(stat.endpoint).hostname}</span>
                                <span className={stat.latency < 500 ? "text-[#00ff41]" : "text-yellow-500"}>
                                    {stat.latency}ms
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
