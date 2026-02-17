#!/bin/bash

# VERCEL AUTO-FIX SCRIPT
# Automatically configures Vercel project settings

echo "🚀 VERCEL AUTO-FIX STARTING..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not installed"
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (will open browser)
echo "📝 Please login to Vercel..."
vercel login

# Link to project
echo "🔗 Linking to Vercel project..."
cd app
vercel link

# Set environment variables
echo "⚙️ Setting environment variables..."
vercel env add NEXT_PUBLIC_RPC_ENDPOINT production
# When prompted, enter: https://api.devnet.solana.com

vercel env add NEXT_PUBLIC_PROGRAM_ID production
# When prompted, enter: 3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK

# Deploy
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "Check your site at: https://proofofplay.vercel.app"
echo ""
