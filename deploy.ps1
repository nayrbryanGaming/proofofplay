# 🚀 Quick Deployment Script

Write-Host "========================================" -ForegroundColor Green
Write-Host "  PROOF OF PLAY DUNGEON - DEPLOYMENT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Step 1: Build Anchor Program
Write-Host "📦 Step 1: Building Anchor program..." -ForegroundColor Cyan
anchor build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Make sure Anchor is installed." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""

# Step 2: Get Program ID
Write-Host "📋 Step 2: Getting Program ID..." -ForegroundColor Cyan
$programId = (anchor keys list | Select-String "proof_of_play" | ForEach-Object { ($_ -split ': ')[1].Trim() })
Write-Host "Program ID: $programId" -ForegroundColor Yellow
Write-Host ""

# Step 3: Deploy to Devnet
Write-Host "🚀 Step 3: Deploying to Devnet..." -ForegroundColor Cyan
Write-Host "⚠️  Make sure you have at least 4 SOL in your wallet!" -ForegroundColor Yellow
Write-Host "Check balance: solana balance" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue with deployment? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

anchor deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""

# Step 4: Copy IDL
Write-Host "📄 Step 4: Copying IDL to frontend..." -ForegroundColor Cyan
Copy-Item "target/idl/proof_of_play.json" -Destination "app/src/components/idl.json"
Write-Host "✅ IDL copied!" -ForegroundColor Green
Write-Host ""

# Step 5: Update .env.local
Write-Host "⚙️  Step 5: Updating environment variables..." -ForegroundColor Cyan
$envPath = "app/.env.local"
$envContent = Get-Content $envPath -Raw
$envContent = $envContent -replace 'NEXT_PUBLIC_PROGRAM_ID=.*', "NEXT_PUBLIC_PROGRAM_ID=$programId"
Set-Content -Path $envPath -Value $envContent
Write-Host "✅ Environment updated with Program ID!" -ForegroundColor Green
Write-Host ""

# Step 6: Final Instructions
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test locally: cd app && npm run dev"
Write-Host "2. Push to GitHub: git add . && git commit -m 'Deploy' && git push"
Write-Host "3. Deploy to Vercel: https://vercel.com"
Write-Host ""
Write-Host "Program ID: $programId" -ForegroundColor Yellow
Write-Host "Explorer: https://explorer.solana.com/address/$programId?cluster=devnet" -ForegroundColor Yellow
