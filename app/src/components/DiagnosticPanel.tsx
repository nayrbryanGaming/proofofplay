
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
                className="fixed bottom-4 right-4 bg-gray-900 border border-green-500 text-green-500 p-2 rounded-full hover:bg-green-900 transition-colors z-50 text-xs"
                title="System Diagnostics"
            >
                📟 SYS
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-black border border-green-500 p-4 rounded-lg shadow-2xl z-50 text-xs font-mono text-green-400 opacity-95">
            <div className="flex justify-between items-center mb-4 border-b border-green-800 pb-2">
                <h3 className="font-bold flex items-center">
                    <span className="animate-pulse mr-2">●</span>
                    SYSTEM DIAGNOSTICS
                </h3>
                <div className="flex gap-2">
                    <button onClick={runDiagnostics} className="hover:text-white" disabled={loading}>
                        {loading ? "..." : "↻"}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:text-white">✕</button>
                </div>
            </div>

            {loading && !health ? (
                <div className="text-center py-4">ANALYZING NETWORK...</div>
            ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Overall Status */}
                    <div className={`text-center p-2 rounded ${health?.status === 'healthy' ? 'bg-green-900/30 text-green-300' :
                            health?.status === 'warning' ? 'bg-yellow-900/30 text-yellow-300' :
                                'bg-red-900/30 text-red-300'
                        }`}>
                        STATUS: {health?.status?.toUpperCase() || "UNKNOWN"}
                    </div>

                    {/* Component Checks */}
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>RPC Connection</span>
                            <span>{health?.checks.rpc ? "OK" : "ERR"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Program ID</span>
                            <span>{health?.checks.program ? "OK" : "ERR"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Balance</span>
                            <span>{health?.checks.balance !== null ? health?.checks.balance.toFixed(4) : "--"}</span>
                        </div>
                    </div>

                    {/* Messages */}
                    {health?.messages && health.messages.length > 0 && (
                        <div className="border-t border-green-900 pt-2 text-gray-400">
                            {health.messages.map((msg, i) => (
                                <div key={i} className="truncate">{msg}</div>
                            ))}
                        </div>
                    )}

                    {/* RPC Latency */}
                    <div className="border-t border-green-900 pt-2">
                        <div className="mb-1 font-bold text-gray-500">RPC LATENCY</div>
                        {rpcStats.map((stat, i) => (
                            <div key={i} className="flex justify-between text-gray-400">
                                <span className="truncate w-24">{new URL(stat.endpoint).hostname}</span>
                                <span className={stat.latency < 500 ? "text-green-400" : "text-yellow-400"}>
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
