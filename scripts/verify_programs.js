const { Connection, PublicKey } = require('@solana/web3.js');
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const pids = [
    "hirTPHnA6on8w2ATUku2bKJST2wqhdY5CdWt8SS7d93",
    "hirTPHnA6on8w2ATUku2bKJST2wqhdY5CdWt8SS7d93"
];

async function check() {
    for (const pid of pids) {
        try {
            const pubkey = new PublicKey(pid);
            const info = await connection.getAccountInfo(pubkey);
            console.log(`Checking ${pid}...`);
            if (!info) {
                console.log(`  - Status: NOT_FOUND`);
            } else {
                console.log(`  - Status: FOUND`);
                console.log(`  - Executable: ${info.executable}`);
                console.log(`  - Owner: ${info.owner.toBase58()}`);
            }
        } catch (e) {
            console.log(`  - Error checking ${pid}: ${e.message}`);
        }
    }
}

check();
