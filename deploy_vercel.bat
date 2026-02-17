@echo off
REM VERCEL AUTO-FIX SCRIPT (Windows)
REM Automatically configures Vercel project settings

echo 🚀 VERCEL AUTO-FIX STARTING...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not installed
    echo Installing Vercel CLI...
    npm install -g vercel
)

REM Login to Vercel
echo 📝 Please login to Vercel...
vercel login

REM Link to project
echo 🔗 Linking to Vercel project...
cd app
vercel link

REM Set environment variables
echo ⚙️ Setting environment variables...
echo When prompted, enter: https://api.devnet.solana.com
vercel env add NEXT_PUBLIC_RPC_ENDPOINT production

echo When prompted, enter: 3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK
vercel env add NEXT_PUBLIC_PROGRAM_ID production

REM Deploy
echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo Check your site at: https://proofofplay.vercel.app
echo.

pause
