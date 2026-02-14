@echo off
echo ==================================================
echo   MINTING DEMO NFT (RUSTY SWORD)
echo ==================================================

echo 1. Creating Token...
spl-token create-token --decimals 0 > token.txt
for /f "tokens=3" %%a in ('findstr "Creating" token.txt') do set TOKEN_ADDRESS=%%a

echo Token Address: %TOKEN_ADDRESS%

echo 2. Creating Account...
spl-token create-account %TOKEN_ADDRESS%

echo 3. Minting 1 Token...
spl-token mint %TOKEN_ADDRESS% 1

echo 4. Disabling Mint Authority (NFT)...
spl-token authorize %TOKEN_ADDRESS% mint --disable

echo.
echo ==================================================
echo   NFT MINTED SUCCESSFULLY: %TOKEN_ADDRESS%
echo ==================================================
echo.
echo [ACTION REQUIRED]
echo Update .env.local with:
echo NEXT_PUBLIC_EQUIP_MINT=%TOKEN_ADDRESS%
echo.
pause
