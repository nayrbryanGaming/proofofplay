// Health check and diagnostic utilities for Proof of Play Dungeon

import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";

export interface HealthCheckResult {
    status: "healthy" | "warning" | "error";
    checks: {
        rpc: boolean;
        program: boolean;
        wallet: boolean;
        balance: number | null;
        pdaExists: boolean | null;
    };
    messages: string[];
}

/**
 * Comprehensive health check for the game
 */
export async function performHealthCheck(
    connection: Connection,
    programId: PublicKey,
    walletPublicKey: PublicKey | null
): Promise<HealthCheckResult> {
    const result: HealthCheckResult = {
        status: "healthy",
        checks: {
            rpc: false,
            program: false,
            wallet: false,
            balance: null,
            pdaExists: null,
        },
        messages: [],
    };

    // 1. Check RPC connection
    try {
        const version = await connection.getVersion();
        result.checks.rpc = true;
        result.messages.push(`✅ RPC connected (version: ${version["solana-core"]})`);
    } catch (e) {
        result.checks.rpc = false;
        result.messages.push("❌ RPC connection failed");
        result.status = "error";
        return result;
    }

    // 2. Check program exists
    try {
        const accountInfo = await connection.getAccountInfo(programId);
        if (accountInfo && accountInfo.executable) {
            result.checks.program = true;
            result.messages.push(`✅ Program found at ${programId.toString().slice(0, 8)}...`);
        } else {
            result.checks.program = false;
            result.messages.push("❌ Program not found or not executable");
            result.status = "error";
        }
    } catch (e) {
        result.checks.program = false;
        result.messages.push("❌ Program check failed");
        result.status = "error";
    }

    // 3. Check wallet
    if (walletPublicKey) {
        result.checks.wallet = true;
        result.messages.push(`✅ Wallet connected: ${walletPublicKey.toString().slice(0, 8)}...`);

        // 4. Check balance
        try {
            const balance = await connection.getBalance(walletPublicKey);
            result.checks.balance = balance / web3.LAMPORTS_PER_SOL;

            if (balance === 0) {
                result.messages.push("⚠️ Wallet has 0 SOL. Airdrop needed.");
                result.status = "warning";
            } else {
                result.messages.push(`✅ Balance: ${(balance / web3.LAMPORTS_PER_SOL).toFixed(4)} SOL`);
            }
        } catch (e) {
            result.messages.push("❌ Balance check failed");
            result.status = "warning";
        }

        // 5. Check if PDA exists
        try {
            const [pda] = PublicKey.findProgramAddressSync(
                [Buffer.from("player"), walletPublicKey.toBuffer()],
                programId
            );

            const pdaInfo = await connection.getAccountInfo(pda);
            result.checks.pdaExists = !!pdaInfo;

            if (pdaInfo) {
                result.messages.push(`✅ Player account exists at ${pda.toString().slice(0, 8)}...`);
            } else {
                result.messages.push("ℹ️ Player account not initialized yet");
            }
        } catch (e) {
            result.messages.push("⚠️ PDA check failed");
            result.status = "warning";
        }
    } else {
        result.checks.wallet = false;
        result.messages.push("⚠️ Wallet not connected");
        result.status = "warning";
    }

    return result;
}

/**
 * Test RPC endpoints and find the fastest
 */
export async function testRPCEndpoints(): Promise<{
    endpoint: string;
    latency: number;
    status: string;
}[]> {
    const endpoints = [
        "https://api.devnet.solana.com",
        "https://rpc.ankr.com/solana_devnet",
        "https://devnet.helius-rpc.com/?api-key=",
    ];

    const results = await Promise.all(
        endpoints.map(async (endpoint) => {
            const start = Date.now();
            try {
                const connection = new Connection(endpoint, "confirmed");
                await connection.getVersion();
                const latency = Date.now() - start;
                return { endpoint, latency, status: "✅ OK" };
            } catch (e) {
                return { endpoint, latency: 9999, status: "❌ Failed" };
            }
        })
    );

    return results.sort((a, b) => a.latency - b.latency);
}

/**
 * Decode and explain transaction error
 */
export function parseTransactionError(error: unknown): string {
    const errorStr = error instanceof Error ? error.message : String(error);

    // Common Anchor errors
    if (errorStr.includes("NoEvent")) {
        return "You must explore before fighting. Click 'Explore' first.";
    }
    if (errorStr.includes("NothingToClaim")) {
        return "No reward available. Win a battle first.";
    }
    if (errorStr.includes("PlayerDead")) {
        return "Your player is dead (HP = 0). Create a new player.";
    }
    if (errorStr.includes("InvalidStats")) {
        return "Invalid stats. HP: 1-100, ATK: 1-50, DEF: 0-20.";
    }
    if (errorStr.includes("Unauthorized")) {
        return "You don't own this player account.";
    }

    // Common Solana errors
    if (errorStr.includes("insufficient funds")) {
        return "Not enough SOL. Request airdrop from Solana faucet.";
    }
    if (errorStr.includes("already in use")) {
        return "Account already exists. Try a different wallet.";
    }
    if (errorStr.includes("Transaction simulation failed")) {
        return "Transaction would fail. Check your wallet balance and account state.";
    }
    if (errorStr.includes("timeout")) {
        return "RPC timeout. Try again or use a different RPC endpoint.";
    }

    return `Unknown error: ${errorStr.slice(0, 100)}`;
}

/**
 * Format transaction signature for display
 */
export function formatTxSignature(signature: string): string {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
}

/**
 * Get Solana Explorer link
 */
export function getExplorerLink(
    signature: string,
    cluster: "devnet" | "mainnet-beta" = "devnet"
): string {
    return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

/**
 * Estimate transaction cost
 */
export async function estimateTransactionCost(
    connection: Connection
): Promise<number> {
    try {
        const { feeCalculator } = await connection.getRecentBlockhash();
        return feeCalculator.lamportsPerSignature / web3.LAMPORTS_PER_SOL;
    } catch {
        return 0.000005; // Default estimate
    }
}
