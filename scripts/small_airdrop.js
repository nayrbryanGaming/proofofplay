const { Connection, PublicKey } = require('@solana/web3.js');
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const address = new PublicKey("35z7X59rtyts557Up1RAwpyYN7x2cFqcDc7RjPuNxFzr");

console.log("Attempting small (0.2 SOL) emergency airdrop...");
connection.requestAirdrop(address, 200000000)
    .then(sig => {
        console.log("✅ AIRDROP_SUCCESS! Sig:", sig);
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ FAILED:", err.message);
        process.exit(1);
    });
