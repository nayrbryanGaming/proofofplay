const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '../app/.env.local');

console.log('--- SWITCHING TO MAINNET ---');

try {
    let envContent = '';
    if (fs.existsSync(ENV_PATH)) {
        envContent = fs.readFileSync(ENV_PATH, 'utf8');
    }

    // Replace RPC
    envContent = envContent.replace(/NEXT_PUBLIC_RPC_ENDPOINT=https:\/\/api\.devnet\.solana\.com/g, 'NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com');

    // If not present, append
    if (!envContent.includes('NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com')) {
        if (!envContent.includes('NEXT_PUBLIC_RPC_ENDPOINT')) {
            envContent += '\nNEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com\n';
        }
    }

    fs.writeFileSync(ENV_PATH, envContent);
    console.log(`✅ Updated ${ENV_PATH} to MAINNET.`);

} catch (e) {
    console.error('❌ Error switching to Mainnet:', e);
}
console.log('------------------------------------');
