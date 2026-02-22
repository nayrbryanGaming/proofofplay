const { Connection, PublicKey } = require('@solana/web3.js');
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const address = new PublicKey("35z7X59rtyts557Up1RAwpyYN7x2cFqcDc7RjPuNxFzr");

console.log("Initiating emergency airdrop for 35z7X59rtyts557Up1RAwpyYN7x2cFqcDc7RjPuNxFzr...");
connection.requestAirdrop(address, 1000000000)
    .then(sig => {
        console.log("✅ AIRDROP SUCCESS! Signature:", sig);
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ AIRDROP FAILED:", err.message);
        process.exit(1);
    });
