import { useState, useEffect } from 'react';
import { txHistory, TransactionRecord } from '../utils/transactionHistory';

export const TransactionHistoryPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [stats, setStats] = useState(txHistory.getStats());

    useEffect(() => {
        // Load on mount
        txHistory.load();
        refresh();

        // Auto-refresh every 5 seconds when open
        if (isOpen) {
            const interval = setInterval(refresh, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const refresh = () => {
        setTransactions(txHistory.getAll());
        setStats(txHistory.getStats());
    };

    const getActionEmoji = (action: string) => {
        switch (action) {
            case 'init': return '🎮';
            case 'explore': return '🗺️';
            case 'fight': return '⚔️';
            case 'claim': return '🎁';
            default: return '📝';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-400';
            case 'failed': return 'text-red-400';
            case 'pending': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-16 right-4 bg-black border border-[#00ff41] text-[#00ff41] p-2 rounded-none hover:bg-[#00ff41] hover:text-black transition-colors z-50 text-xs font-mono tracking-wider psg1-glow"
                title="Transaction History"
            >
                [ HISTORY ({transactions.length}) ]
            </button>
        );
    }

    return (
        <div className="fixed bottom-16 right-4 w-96 bg-black/95 border-2 border-[#00ff41] p-4 shadow-[0_0_20px_rgba(0,255,65,0.2)] z-50 text-xs font-mono text-[#00ff41] max-h-[500px] overflow-hidden flex flex-col backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3 border-b border-[#00ff41] pb-2">
                <h3 className="font-bold flex items-center tracking-widest">
                    <span className="mr-2">📜</span>
                    TX_HISTORY_LOG
                </h3>
                <div className="flex gap-2">
                    <button onClick={refresh} className="hover:text-white hover:bg-[#00ff41] px-1 text-xs">[R]</button>
                    <button onClick={() => { txHistory.clear(); refresh(); }} className="hover:text-white hover:bg-[#00ff41] px-1 text-xs">[CLR]</button>
                    <button onClick={() => setIsOpen(false)} className="hover:text-white hover:bg-[#00ff41] px-1">[X]</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                <div className="bg-[#00ff41]/10 border border-[#00ff41] p-1">
                    <div className="text-[#00ff41]/50 text-[10px]">TOTAL</div>
                    <div className="text-white font-bold">{stats.total}</div>
                </div>
                <div className="bg-green-900/30 border border-green-500 p-1">
                    <div className="text-green-500/70 text-[10px]">OK</div>
                    <div className="text-green-400 font-bold">{stats.successful}</div>
                </div>
                <div className="bg-red-900/30 border border-red-500 p-1">
                    <div className="text-red-500/70 text-[10px]">FAIL</div>
                    <div className="text-red-400 font-bold">{stats.failed}</div>
                </div>
                <div className="bg-blue-900/30 border border-blue-500 p-1">
                    <div className="text-blue-500/70 text-[10px]">RATE</div>
                    <div className="text-blue-400 font-bold">{stats.successRate}%</div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {transactions.length === 0 ? (
                    <div className="text-center text-[#00ff41]/50 py-8 border border-dashed border-[#00ff41]/30">
                        NO_DATA_FOUND<br />
                        INITIATE_ACTIONS_TO_POPULATE
                    </div>
                ) : (
                    transactions.map((tx, i) => (
                        <div key={i} className="bg-black p-2 border border-[#00ff41]/30 hover:border-[#00ff41] transition-colors group">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span>{getActionEmoji(tx.action)}</span>
                                    <span className="uppercase font-bold text-[#00ff41] group-hover:text-white">{tx.action}</span>
                                </div>
                                <span className={`text-[10px] uppercase font-bold ${tx.status === 'success' ? 'text-green-400' :
                                        tx.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                    [{tx.status}]
                                </span>
                            </div>
                            <div className="text-[10px] text-[#00ff41]/60 truncate font-mono">
                                SIG: {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                            </div>
                            <div className="flex justify-between items-center mt-1 pt-1 border-t border-[#00ff41]/20">
                                <span className="text-[10px] text-[#00ff41]/40">
                                    {new Date(tx.timestamp).toLocaleTimeString()}
                                </span>
                                <a
                                    href={tx.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-[#00ff41] hover:bg-[#00ff41] hover:text-black px-1"
                                >
                                    VIEW_ON_CHAIN →
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
