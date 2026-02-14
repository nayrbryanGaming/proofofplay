@echo off
setlocal
title VERCEL DEPLOYMENT - EMERGENCY MODE

echo ==================================================
echo   EMERGENCY DEPLOYMENT TO VERCEL
echo   Target: 24/7 Live URL
echo ==================================================
echo.

:: 1. Check for Vercel CLI via npx
echo [1/3] Checking Vercel CLI...
call npx vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing Vercel CLI...
    call npm install -g vercel
)

:: 2. Deploy
echo [2/3] Deploying to Production...
echo       (You may need to login to Vercel in the browser)
echo.

:: Using --prod to force production deployment
call npx vercel --prod

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Automatic deployment failed.
    echo.
    echo FALLBACK INSTRUCTION:
    echo 1. Go to https://vercel.com/new
    echo 2. Import your GitHub Repository
    echo 3. The 'vercel.json' is already configured for you.
    echo 4. Click DEPLOY.
    echo.
) else (
    echo.
    echo [SUCCESS] DEPLOYMENT COMPLETE.
    echo [INFO] Your project is now LIVE 24/7.
    echo.
)

pause
