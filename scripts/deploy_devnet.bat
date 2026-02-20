@echo off
echo [DEPLOY] Setting up environment...
set "PATH=%CD%\temp_solana\solana-release\bin;%PATH%"
set "SBF_SDK_PATH=%CD%\temp_solana\solana-release\bin\sdk\sbf"

echo [DEPLOY] Checking Solana version...
solana --version

echo [DEPLOY] Building Anchor program...
call anchor build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    exit /b %errorlevel%
)

echo [DEPLOY] Deploying to Devnet...
call anchor deploy --provider.cluster https://api.devnet.solana.com --provider.wallet target/deploy/proof_of_play-keypair.json
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed.
    exit /b %errorlevel%
)

echo [SUCCESS] Deployed successfully!
