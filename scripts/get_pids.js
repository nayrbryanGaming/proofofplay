const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const keypairPath = path.join(__dirname, '..', 'target', 'deploy', 'new-program.json');
const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('Program ID (new-program.json):', keypair.publicKey.toBase58());
