@echo off
setlocal enabledelayedexpansion
title Proof of Play Dungeon - MASTER DEPLOYMENT

echo ==================================================
echo   MASTER DEPLOYMENT CONTROLLER
echo   "EXECUTE ALL NOW" MODE
echo ==================================================
echo.
echo [1] DEVNET DEPLOYment (Standard)
echo [2] MAINNET DEPLOYMENT (Real Money - DANGER)
echo [3] GITHUB ACTIONS TRIGGER (Push Code)
echo [4] EXIT
echo.
set /p choice="Select Operation [1-4]: "

if "%choice%"=="1" goto devnet
if "%choice%"=="2" goto mainnet
if "%choice%"=="3" goto github
if "%choice%"=="4" exit /b

:devnet
cls
call deploy_prod.bat
goto end

:mainnet
cls
echo [WARNING] YOU ARE ABOUT TO DEPLOY TO MAINNET.
echo [WARNING] THIS WILL COST REAL SOL (~2 SOL).
echo.
set /p confirm="Type 'CONFIRM' to proceed: "
if /i not "%confirm%"=="CONFIRM" goto end
echo.
echo Switching to Mainnet...
solana config set --url mainnet-beta
echo.
echo Building...
call anchor build
echo.
echo Deploying...
call anchor deploy
echo.
echo [INFO] If successful, update your .env.local with the new Program ID.
pause
goto end

:github
cls
call deploy_to_git.bat
goto end

:end
echo.
echo OPERATION COMPLETE.
pause
