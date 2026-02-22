const { Connection, PublicKey } = require('@solana/web3.js');
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const address = new PublicKey("35z7X59rtyts557Up1RAwpyYN7x2cFqcDc7RjPuNxFzr");
connection.getBalance(address).then(bal => {
    console.log("FINAL_BALANCE:", bal / 1e9, "SOL");
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
