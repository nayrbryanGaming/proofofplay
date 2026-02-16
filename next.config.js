/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: false,
    env: {
        NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com",
        NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID || "3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK",
        NEXT_PUBLIC_EQUIP_MINT: process.env.NEXT_PUBLIC_EQUIP_MINT || "MINT_ADDRESS_HERE",
    },
    images: {
        unoptimized: true,
        domains: ['arweave.net', 'shdw-drive.genesysgo.net'],
    },
};

module.exports = nextConfig;
