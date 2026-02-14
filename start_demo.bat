@echo off
setlocal enabledelayedexpansion
title Proof of Play Dungeon - SUPER PERFECT LAUNCHER

echo ==================================================
echo   PROOF OF PLAY DUNGEON - HACKATHON DEMO MODE
echo   Status: SUPER PERFECT
echo ==================================================
echo.

:: 1. Check Node.js
echo [1/4] Checking Environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed.
    echo Please install generic Node.js LTS to proceed.
    pause
    exit /b
)
echo [OK] Node.js found.

:: 2. Check Dependencies
if not exist "app\node_modules" (
    echo [2/4] Installing dependencies (First Run)...
    cd app
    call npm install
    cd ..
) else (
    echo [OK] Dependencies ready.
)

:: 3. Check Anchor Build
if not exist "target\deploy\proof_of_play.so" (
    echo [3/4] Anchor build not found. Building...
    call anchor build
) else (
    echo [OK] Anchor program built.
)

:: 3.5 Copy IDL & Setup Env
echo [INFO] Updating Frontend Configuration...
if exist "target\idl\proof_of_play.json" (
    copy /Y "target\idl\proof_of_play.json" "app\src\components\idl.json" >nul
    echo [OK] IDL updated.
    
    echo [INFO] Auto-configuring .env.local...
    node scripts/setup_env.js
) else (
    echo [WARNING] IDL file not found in target/idl. Build might have failed.
)

:: 4. Launch
echo.
echo [4/4] Launching "Proof of Play Dungeon" CLIENT...
echo.
echo       - Open your browser to: http://localhost:3000
echo       - Prepare your script: DEMO_SCRIPT.md
echo.
echo ==================================================
echo.

cd app
call npm run dev
pause
