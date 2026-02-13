# 🎯 QUICK START - Proof of Play Dungeon

## ⚡ 35-Minute Path to Live Demo

### Step 1: Install Solana CLI (5 min)
```powershell
# Download
curl https://release.solana.com/v1.18.22/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe

# Install
C:\solana-install-tmp\solana-install-init.exe v1.18.22

# Add to PATH
$env:PATH += ";C:\Users\$env:USERNAME\.local\share\solana\install\active_release\bin"

# Verify
solana --version
```

### Step 2: Configure Devnet (2 min)
```powershell
# Set Devnet
solana config set --url https://api.devnet.solana.com

# Create wallet
solana-keygen new

# Airdrop (run 3x)
solana airdrop 2
solana airdrop 2
solana airdrop 2

# Verify
solana balance  # Should show ~6 SOL
```

### Step 3: Install Anchor (10 min)
```powershell
# Install AVM
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install Anchor
avm install 0.29.0
avm use 0.29.0

# Verify
anchor --version
```

### Step 4: Deploy (5 min)
```powershell
cd "e:\000VSCODE PROJECT MULAI DARI DESEMBER 2025\Proof of Play Dungeon\proof_of_play"

# Automated deployment
.\deploy.ps1
```

### Step 5: Test (5 min)
```powershell
cd app
npm install
npm run dev
```

Open `http://localhost:3000` and test!

### Step 6: Deploy to Vercel (8 min)
```powershell
# Git setup
git init
git add .
git commit -m "Ready for hackathon"

# Push to GitHub (create repo first!)
git remote add origin YOUR_REPO_URL
git push -u origin main
```

Then on vercel.com:
1. Import from GitHub
2. Root Directory: `app`
3. Add env vars (from deploy.ps1 output)
4. Deploy!

---

## ✅ Success Checklist

- [ ] `solana --version` works
- [ ] `anchor --version` shows 0.29.0
- [ ] `solana balance` shows 6+ SOL
- [ ] `.\deploy.ps1` completes successfully
- [ ] `npm run dev` works locally
- [ ] Can play full game loop
- [ ] Vercel deployment live

**YOU'RE READY! 🚀**

For detailed help, see [README.md](./README.md)
