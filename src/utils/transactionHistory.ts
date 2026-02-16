// Transaction history tracker for displaying all on-chain actions
import { Connection, PublicKey } from '@solana/web3.js';

export interface TransactionRecord {
    signature: string;
    timestamp: number;
    action: 'init' | 'explore' | 'fight' | 'claim' | 'equip';
    status: 'success' | 'pending' | 'failed';
    explorerUrl: string;
}

export class TransactionHistory {
    private history: TransactionRecord[] = [];
    private maxRecords = 20;

    add(signature: string, action: TransactionRecord['action'], cluster: 'devnet' | 'mainnet-beta' = 'devnet') {
        const record: TransactionRecord = {
            signature,
            timestamp: Date.now(),
            action,
            status: 'pending',
            explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`
        };

        this.history.unshift(record);

        // Keep only last N records
        if (this.history.length > this.maxRecords) {
            this.history = this.history.slice(0, this.maxRecords);
        }

        // Save to localStorage
        this.save();
    }

    updateStatus(signature: string, status: TransactionRecord['status']) {
        const record = this.history.find(r => r.signature === signature);
        if (record) {
            record.status = status;
            this.save();
        }
    }

    getAll(): TransactionRecord[] {
        return [...this.history];
    }

    clear() {
        this.history = [];
        this.save();
    }

    private save() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('pop_tx_history', JSON.stringify(this.history));
        }
    }

    load() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pop_tx_history');
            if (saved) {
                try {
                    this.history = JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to load transaction history', e);
                }
            }
        }
    }

    // Get statistics
    getStats() {
        const total = this.history.length;
        const successful = this.history.filter(r => r.status === 'success').length;
        const failed = this.history.filter(r => r.status === 'failed').length;
        const pending = this.history.filter(r => r.status === 'pending').length;

        return {
            total,
            successful,
            failed,
            pending,
            successRate: total > 0 ? (successful / total * 100).toFixed(1) : '0'
        };
    }

    // Get action counts
    getActionCounts() {
        return {
            init: this.history.filter(r => r.action === 'init').length,
            explore: this.history.filter(r => r.action === 'explore').length,
            fight: this.history.filter(r => r.action === 'fight').length,
            claim: this.history.filter(r => r.action === 'claim').length,
            equip: this.history.filter(r => r.action === 'equip').length,
        };
    }
}

// Singleton instance
export const txHistory = new TransactionHistory();
