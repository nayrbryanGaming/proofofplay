@echo off
setlocal enabledelayedexpansion
title Proof of Play Dungeon - PRODUCTION DEPLOYMENT

echo ==================================================
echo   PRODUCTION DEPLOYMENT SEQUENCE
echo   Target: DEVNET / VERCEL
echo ==================================================
echo.

:: 1. Anchor Build & Deploy
echo [1/3] Building Anchor Program...
call anchor build
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo [2/3] Deploying to Solana Devnet...
echo       (Ensure you have SOL: solana airdrop 2)
call anchor deploy
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed. Check SOL balance.
    exit /b %errorlevel%
)

:: 2. Sync IDL & Env
echo.
echo [2.5/3] Syncing IDL & Environment...
copy /Y "target\idl\proof_of_play.json" "app\src\components\idl.json" >nul
node scripts/setup_env.js

:: 3. Frontend Build
echo.
echo [3/3] Building Frontend for Production...
cd app
call npm install
call npm run build
cd ..

echo.
echo ==================================================
echo   DEPLOYMENT PREAGRE COMPLETE
echo ==================================================
echo.
echo NEXT STEPS:
echo 1. git add .
echo 2. git commit -m "Deploy Production"
echo 3. git push origin main
echo.
echo (GitHub Actions will handle the rest if configured)
echo (Vercel will auto-deploy the frontend)
echo.
pause
