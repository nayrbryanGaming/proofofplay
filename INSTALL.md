# 🚀 Quick Installation Guide - Proof of Play Dungeon

## Current Status: Ready for Installation ✅

You have:
- ✅ Rust installed (cargo 1.93.0)
- ✅ Node.js installed
- ✅ All code fixed and ready
- ✅ npm dependencies installed

## Next: Install Solana CLI & Anchor

### STEP 1: Install Solana CLI (Windows)

**Open PowerShell as Administrator**, then run:

```powershell
# Download Solana installer
cmd /c "curl https://release.solana.com/v1.18.22/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"

# Run installer
C:\solana-install-tmp\solana-install-init.exe v1.18.22
```

**RESTART your terminal**, then verify:

```powershell
solana --version
# Should show: solana-cli 1.18.22
```

---

### STEP 2: Configure Solana for Devnet

```powershell
# Set to Devnet (24/7 blockchain)
solana config set --url devnet

# Generate wallet (save the seed phrase!)
solana-keygen new --outfile ~/.config/solana/id.json

# Get your public key
solana address

# Airdrop SOL for deployment (run multiple times)
solana airdrop 2
solana airdrop 2

# Check balance (need at least 4 SOL)
solana balance
```

---

### STEP 3: Install Anchor Framework

```powershell
# Install avm (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install Anchor 0.29.0 (matching project version)
avm install 0.29.0
avm use 0.29.0

# Verify
anchor --version
# Should show: anchor-cli 0.29.0
```

---

### STEP 4: Build Anchor Program

```powershell
cd "e:\000VSCODE PROJECT MULAI DARI DESEMBER 2025\Proof of Play Dungeon\proof_of_play"

# Build program
anchor build
```

**IMPORTANT:** After build, you'll see:
```
Program Id: <YOUR_PROGRAM_ID>
```

**Copy this ID!** You'll need it next.

---

### STEP 5: Update Program ID

#### 5a. Edit `programs/proof_of_play/src/lib.rs`

Find line 4:
```rust
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
```

Replace with your actual Program ID from build:
```rust
declare_id!("YOUR_ACTUAL_PROGRAM_ID");
```

#### 5b. Edit `Anchor.toml`

Find:
```toml
[programs.devnet]
proof_of_play = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
```

Replace with:
```toml
[programs.devnet]
proof_of_play = "YOUR_ACTUAL_PROGRAM_ID"
```

#### 5c. Rebuild

```powershell
anchor build
```

---

### STEP 6: Deploy to Devnet

```powershell
# Check you have enough SOL
solana balance

# Deploy (costs ~0.5-1 SOL)
anchor deploy
```

**🎉 Program is now live on Solana Devnet 24/7!**

---

### STEP 7: Update Frontend

#### 7a. Copy IDL

```powershell
cp target/idl/proof_of_play.json app/src/components/idl.json
```

#### 7b. Update Environment Variables

Edit `app/.env.local`:

```env
NEXT_PUBLIC_PROGRAM_ID=YOUR_ACTUAL_PROGRAM_ID
NEXT_PUBLIC_EQUIP_MINT=MINT_ADDRESS_HERE
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

---

### STEP 8: Test Locally

```powershell
cd app
npm run dev
```

Open: http://localhost:3000

Test:
1. Connect wallet (Phantom/Solflare on Devnet)
2. Init Player → Copy TX → Check on https://explorer.solana.com/?cluster=devnet
3. Explore → Verify transaction
4. Fight → Verify transaction
5. Claim → Verify transaction

---

### STEP 9: Deploy to Vercel

```powershell
# Initialize git
git init
git add .
git commit -m "Proof of Play Dungeon ready"

# Create GitHub repo and push
# (Create repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/proof-of-play-dungeon.git
git push -u origin main
```

**Then:**
1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub
4. Set **Root Directory**: `app`
5. Add environment variables:
   - `NEXT_PUBLIC_PROGRAM_ID`
   - `NEXT_PUBLIC_EQUIP_MINT`
   - `NEXT_PUBLIC_RPC_ENDPOINT`
6. Click "Deploy"

**🎉 Live 24/7 at: https://your-app.vercel.app**

---

## Optional: Mint NFT with Metaplex

```powershell
# Install Sugar CLI
cargo install sugar-cli --locked

# Navigate to assets
cd assets

# Launch minting
sugar launch

# Follow prompts, then update .env.local with the mint address
```

---

## 🎯 Final Checklist

- [ ] Solana CLI installed
- [ ] Anchor installed
- [ ] Program built
- [ ] Program deployed to Devnet
- [ ] IDL copied to frontend
- [ ] Environment variables updated
- [ ] Tested locally
- [ ] Deployed to Vercel
- [ ] **READY TO DEMO! 🎮**

---

## ⏱️ Time Estimate

- Solana CLI install: 5 min
- Anchor install: 10 min  
- Build & deploy: 5 min
- Test: 10 min
- Vercel deploy: 5 min

**Total: ~35 minutes to completion!**

**You're almost there! Let's finish this! 💪**
