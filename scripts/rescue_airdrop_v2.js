const { Connection, PublicKey } = require('@solana/web3.js');

const WALLET_ADDRESS = "35z7X59rtyts557Up1RAwpyYN7x2cFqcDc7RjPuNxFzr";
const RPC_ENDPOINTS = [
    "https://api.devnet.solana.com",
    "https://rpc.ankr.com/solana_devnet",
    "https://api.testnet.solana.com", // backup testnet just in case
    "https://devnet.helius-rpc.com/?api-key=test"
];

async function tryAirdrop() {
    console.log(`Starting emergency airdrop sequence for ${WALLET_ADDRESS}...`);
    const address = new PublicKey(WALLET_ADDRESS);

    for (const endpoint of RPC_ENDPOINTS) {
        console.log(`Trying endpoint: ${endpoint}`);
        try {
            const connection = new Connection(endpoint, "confirmed");
            const signature = await connection.requestAirdrop(address, 1000000000); // 1 SOL
            console.log(`✅ SUCCESS on ${endpoint}! Signature: ${signature}`);

            // Wait a bit for confirmation
            await new Promise(r => setTimeout(r, 2000));
            const balance = await connection.getBalance(address);
            console.log(`New Balance: ${balance / 1e9} SOL`);
            return;
        } catch (err) {
            console.error(`❌ Failed on ${endpoint}: ${err.message}`);
        }
    }
    console.log("CRITICAL: All RPC endpoints failed. Moving to browser-based faucet attempt.");
    process.exit(1);
}

tryAirdrop().catch(e => {
    console.error("FATAL SCRIPT ERROR:", e);
    process.exit(1);
});
