/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: false,
    env: {
        NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com",
        NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID || "hirTPHnA6on8w2ATUku2bKJST2wqhdY5CdWt8SS7d93",
        NEXT_PUBLIC_EQUIP_MINT: process.env.NEXT_PUBLIC_EQUIP_MINT || "MINT_ADDRESS_HERE",
    },
    images: {
        unoptimized: true,
        domains: ['arweave.net', 'shdw-drive.genesysgo.net'],
    },
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            os: false,
            path: false,
            crypto: false,
        };
        config.plugins.push(
            new (require('webpack')).ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            })
        );
        return config;
    },
};

module.exports = nextConfig;
