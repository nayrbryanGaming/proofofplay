# 🔧 Troubleshooting Guide - Proof of Play Dungeon

## Common Issues & Solutions

### 🔴 Installation Issues

#### Solana CLI Not Found
```powershell
solana --version
# Error: 'solana' is not recognized
```

**Solution:**
```powershell
# Add to PATH
$env:PATH += ";C:\Users\$env:USERNAME\.local\share\solana\install\active_release\bin"

# Restart terminal
```

#### Anchor Build Fails
```
Error: failed to get nightly features
```

**Solution:**
```powershell
rustup update
rustup default stable
anchor build
```

---

### 🔴 Deployment Issues

#### Insufficient SOL for Deployment
```
Error: insufficient lamports for rent
```

**Solution:**
```powershell
# Check balance
solana balance

# Airdrop more (run multiple times)
solana airdrop 2
solana airdrop 2
solana airdrop 2

# Verify
solana balance  # Should show 6+ SOL
```

#### Program ID Mismatch
```
Error: The given public key does not match the program's one
```

**Solution:**
1. After `anchor build`, copy the Program ID shown
2. Update `programs/proof_of_play/src/lib.rs` line 4:
   ```rust
   declare_id!("YOUR_ACTUAL_PROGRAM_ID");
   ```
3. Update `Anchor.toml` line 8:
   ```toml
   proof_of_play = "YOUR_ACTUAL_PROGRAM_ID"
   ```
4. Rebuild:
   ```powershell
   anchor build
   anchor deploy
   ```

#### Wallet File Not Found
```
Error: No such file or directory ~/.config/solana/id.json
```

**Solution:**
```powershell
# Generate new wallet
solana-keygen new --outfile ~/.config/solana/id.json

# Set as default
solana config set --keypair ~/.config/solana/id.json
```

---

### 🔴 Frontend Issues

#### "Program ID mismatch" Error

**Symptoms:** Frontend shows errors when calling program

**Solution:**
```powershell
# 1. Get deployed program ID
anchor keys list

# 2. Update app/.env.local
NEXT_PUBLIC_PROGRAM_ID=YOUR_ACTUAL_PROGRAM_ID

# 3. Copy IDL
cp target/idl/proof_of_play.json app/src/components/idl.json

# 4. Restart dev server
cd app
npm run dev
```

#### Wallet Won't Connect

**Symptoms:** Phantom button doesn't work

**Solutions:**

1. **Install Phantom Wallet**
   - Go to phantom.app
   - Install browser extension
   - Create wallet

2. **Switch to Devnet**
   - Open Phantom
   - Settings → Developer Settings
   - Change Network → Devnet

3. **Clear browser cache**
   ```
   Ctrl + Shift + Delete → Clear cache
   ```

#### "Transaction simulation failed"

**Cause:** Multiple possible reasons

**Solutions:**

1. **Check wallet balance**
   ```powershell
   solana balance
   # If 0: solana airdrop 2
   ```

2. **Player already initialized**
   - Use different wallet, OR
   - Delete player account (not recommended)

3. **RPC overload**
   - Wait 30 seconds
   - Try different RPC in `.env.local`:
     ```
     NEXT_PUBLIC_RPC_ENDPOINT=https://rpc.ankr.com/solana_devnet
     ```

---

### 🔴 Transaction Issues

#### Transactions Stuck "Pending"

**Symptoms:** TX never confirms

**Solutions:**

1. **Wait longer** (Devnet can be slow)
   - Normal: 2-5 seconds
   - Slow: up to 30 seconds

2. **Check explorer manually**
   ```
   https://explorer.solana.com/?cluster=devnet
   ```
   Paste TX signature

3. **Retry transaction**
   - Click "Refresh Account" button
   - Try action again

#### "RPC 429 Too Many Requests"

**Cause:** Rate limiting on public RPC

**Solutions:**

1. **Switch RPC endpoint** in `.env.local`:
   ```env
   # Try these alternatives:
   NEXT_PUBLIC_RPC_ENDPOINT=https://devnet.helius-rpc.com/?api-key=
   NEXT_PUBLIC_RPC_ENDPOINT=https://rpc.ankr.com/solana_devnet
   ```

2. **Wait 1 minute** between many requests

---

### 🔴 Game Logic Issues

#### "NoEvent" Error When Fighting

**Cause:** Must explore before fighting

**Solution:**
1. Click "2. Explore (RNG)"
2. Wait for confirmation
3. Then click "3. Fight"

#### "NothingToClaim" Error

**Cause:** Haven't won a battle yet

**Solution:**
1. Complete: Explore → Fight → Win
2. If you lost, HP will be reduced
3. Try again with recovered stats

#### Player HP = 0 (Dead)

**Cause:** Lost too many battles

**Solutions:**

1. **Create new player** with different wallet
2. **Or** implement healing (advanced feature)

---

### 🟡 Vercel Deployment Issues

#### Build Fails on Vercel

**Error:**
```
Error: Cannot find module './idl.json'
```

**Solution:**
```powershell
# Make sure IDL is copied before deploying
cp target/idl/proof_of_play.json app/src/components/idl.json

# Push to GitHub
git add app/src/components/idl.json
git commit -m "Add IDL"
git push
```

#### Environment Variables Not Set

**Symptoms:** "Program ID undefined" on live site

**Solution:**
1. Go to Vercel Dashboard
2. Project → Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_PROGRAM_ID`
   - `NEXT_PUBLIC_RPC_ENDPOINT`
4. Redeploy

#### Wrong Build Directory

**Error:** "No Next.js build found"

**Solution:**
1. Vercel Dashboard → Project Settings
2. Build & Development Settings
3. **Root Directory:** `app`
4. Redeploy

---

## 🔍 Diagnostic Commands

### Check Everything

```powershell
# 1. Solana CLI
solana --version
solana config get

# 2. Anchor
anchor --version

# 3. Wallet
solana address
solana balance

# 4. Program
anchor keys list

# 5. RPC Connection
solana cluster-version
```

### Get Transaction Details

```powershell
# View transaction on Explorer
solana confirm <TX_SIGNATURE>

# Get detailed logs
solana confirm -v <TX_SIGNATURE>
```

### Test IDL

```powershell
# Verify IDL is valid JSON
cd app/src/components
cat idl.json
```

---

## 📊 Performance Issues

### Slow Transactions

**Expected:**
- Init Player: 2-3 seconds
- Explore: 1-2 seconds  
- Fight: 1-2 seconds
- Claim: 1-2 seconds

**If slower:**
1. Check RPC latency
2. Try different RPC endpoint
3. Check network status: status.solana.com

### High CPU Usage

**Cause:** Too many re-renders

**Solution:**
- Close other browser tabs
- Clear browser cache
- Use Chrome/Brave (best React performance)

---

## 🆘 Still Stuck?

### Debug Checklist

- [ ] Solana CLI installed and in PATH
- [ ] Anchor installed (`anchor --version`)
- [ ] Wallet has SOL (`solana balance`)
- [ ] Program deployed (`anchor keys list`)
- [ ] IDL copied to frontend
- [ ] `.env.local` has correct Program ID
- [ ] Wallet connected to Devnet
- [ ] Browser has Phantom extension

### Get Help

1. **Check transaction on Explorer**
   - Copy TX signature
   - Visit explorer.solana.com
   - Look at "Program Log" tab

2. **Check browser console**
   - F12 → Console tab
   - Look for red errors

3. **Check terminal logs**
   - Look at `npm run dev` output
   - Check for errors

---

## 🎯 Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Wallet won't connect | Switch Phantom to Devnet |
| TX fails | Check balance, airdrop SOL |
| Program not found | `anchor deploy` |
| Build fails | `rustup update` |
| "NoEvent" error | Click Explore first |
| RPC timeout | Switch RPC endpoint |

---

**Still need help? Check the logs on Solana Explorer! 🔍**
