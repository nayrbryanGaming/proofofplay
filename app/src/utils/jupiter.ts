import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";

// --- Step 9: Jupiter Reward Claim ---
// We use Jupiter Aggregator V6 API to swap the "Dungeon Loot" (mock) to SOL/USDC.
// In the hackathon demo, we can swap a tiny amount of SOL to USDC to demonstrate integration.

interface JupiterQuote {
    outAmount: string;
    priceImpactPct: number;
    marketInfos: unknown[]; // Complex structure, safe to use unknown
    [key: string]: unknown;
}

export async function getQuote(inputMint: string, outputMint: string, amount: number): Promise<JupiterQuote> {
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;
    const response = await fetch(url);
    const quote: JupiterQuote = await response.json();
    return quote;
}

export async function getSwapTransaction(quoteResponse: JupiterQuote, userPublicKey: string): Promise<string> {
    const body = {
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
    };

    const response = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const { swapTransaction } = await response.json();
    return swapTransaction;
}

// Helper to deserialize and send
// Wallet adapter type abstraction
interface WalletAdapter {
    sendTransaction(transaction: VersionedTransaction, connection: Connection): Promise<string>;
}

export async function executeSwap(connection: Connection, swapTransactionBase64: string, wallet: WalletAdapter) {
    if (!wallet) throw new Error("Wallet not connected");

    // Deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransactionBase64, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign and send
    const txid = await wallet.sendTransaction(transaction, connection);
    return txid;
}
