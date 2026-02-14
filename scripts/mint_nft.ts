import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { keypairIdentity, generateSigner, percentAmount } from '@metaplex-foundation/umi';
import { userKeypair } from './helpers'; // Assumes a helper to load wallet

// 1. Setup Umi
const umi = createUmi('https://api.devnet.solana.com')
    .use(mplTokenMetadata());

// 2. Load Wallet
const myKeypair = userKeypair('~/.config/solana/id.json');
umi.use(keypairIdentity(myKeypair));

// 3. Mint NFT
(async () => {
    console.log("Minting Rusty Sword...");

    const mint = generateSigner(umi);
    const tx = await createNft(umi, {
        mint,
        name: "Rusty Sword",
        symbol: "POP",
        uri: "https://raw.githubusercontent.com/your-repo/proof_of_play/main/assets/rusty_sword.json",
        sellerFeeBasisPoints: percentAmount(0),
    }).sendAndConfirm(umi);

    console.log(`Minted! Address: ${mint.publicKey.toString()}`);
    console.log(`TX: ${tx.signature.toString()}`);
})();
