/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
        NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID,
        NEXT_PUBLIC_EQUIP_MINT: process.env.NEXT_PUBLIC_EQUIP_MINT,
    },
    images: {
        domains: ['arweave.net', 'shdw-drive.genesysgo.net'], // Common NFT storage
    },
};

module.exports = nextConfig;
