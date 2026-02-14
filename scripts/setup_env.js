const fs = require('fs');
const path = require('path');

const IDL_PATH = path.join(__dirname, '../target/idl/proof_of_play.json');
const ENV_PATH = path.join(__dirname, '../app/.env.local');

console.log('--- AUTO-CONFIGURING ENVIRONMENT ---');

try {
    if (!fs.existsSync(IDL_PATH)) {
        console.error('❌ IDL not found at:', IDL_PATH);
        console.error('   Please run "anchor build" first.');
        process.exit(1);
    }

    const idl = JSON.parse(fs.readFileSync(IDL_PATH, 'utf8'));
    const programId = idl.metadata?.address;

    if (!programId) {
        console.error('❌ Program ID not found in IDL metadata.');
        process.exit(1);
    }

    console.log(`✅ Found Program ID: ${programId}`);

    const envContent = `NEXT_PUBLIC_PROGRAM_ID=${programId}
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
# NEXT_PUBLIC_EQUIP_MINT= (Set this after minting NFT)
`;

    // Only write if it doesn't exist or we want to overwrite (Force overwrite for hackathon consistency)
    fs.writeFileSync(ENV_PATH, envContent);
    console.log(`✅ Wrote to ${ENV_PATH}`);

} catch (e) {
    console.error('❌ Error configuring env:', e);
}
console.log('------------------------------------');
