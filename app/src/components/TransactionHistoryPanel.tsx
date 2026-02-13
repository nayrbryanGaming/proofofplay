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
                className="fixed bottom-16 right-4 bg-gray-900 border border-blue-500 text-blue-500 p-2 rounded-full hover:bg-blue-900 transition-colors z-50 text-xs"
                title="Transaction History"
            >
                📜 TX ({transactions.length})
            </button>
        );
    }

    return (
        <div className="fixed bottom-16 right-4 w-96 bg-black border border-blue-500 p-4 rounded-lg shadow-2xl z-50 text-xs font-mono text-blue-400 opacity-95 max-h-[500px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-3 border-b border-blue-800 pb-2">
                <h3 className="font-bold flex items-center">
                    📜 TRANSACTION HISTORY
                </h3>
                <div className="flex gap-2">
                    <button onClick={refresh} className="hover:text-white text-xs">↻</button>
                    <button onClick={() => { txHistory.clear(); refresh(); }} className="hover:text-white text-xs">🗑️</button>
                    <button onClick={() => setIsOpen(false)} className="hover:text-white">✕</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                <div className="bg-gray-900 p-2 rounded">
                    <div className="text-gray-500 text-[10px]">TOTAL</div>
                    <div className="text-white font-bold">{stats.total}</div>
                </div>
                <div className="bg-green-900/30 p-2 rounded">
                    <div className="text-gray-500 text-[10px]">SUCCESS</div>
                    <div className="text-green-400 font-bold">{stats.successful}</div>
                </div>
                <div className="bg-red-900/30 p-2 rounded">
                    <div className="text-gray-500 text-[10px]">FAILED</div>
                    <div className="text-red-400 font-bold">{stats.failed}</div>
                </div>
                <div className="bg-blue-900/30 p-2 rounded">
                    <div className="text-gray-500 text-[10px]">RATE</div>
                    <div className="text-blue-400 font-bold">{stats.successRate}%</div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {transactions.length === 0 ? (
                    <div className="text-center text-gray-600 py-8">
                        No transactions yet.<br />
                        Start playing to see history!
                    </div>
                ) : (
                    transactions.map((tx, i) => (
                        <div key={i} className="bg-gray-900/50 p-2 rounded border border-gray-800 hover:border-blue-700 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span>{getActionEmoji(tx.action)}</span>
                                    <span className="uppercase font-bold">{tx.action}</span>
                                </div>
                                <span className={`text-[10px] ${getStatusColor(tx.status)}`}>
                                    {tx.status === 'pending' && '⏳ '}
                                    {tx.status === 'success' && '✅ '}
                                    {tx.status === 'failed' && '❌ '}
                                    {tx.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                                {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-gray-600">
                                    {new Date(tx.timestamp).toLocaleTimeString()}
                                </span>
                                <a
                                    href={tx.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-blue-400 hover:text-blue-300"
                                >
                                    Explorer →
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
