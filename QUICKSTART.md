# Proof of Play - Quick Start Guide

## 🚀 IMMEDIATE DEPLOYMENT (5 Minutes)

### Step 1: Deploy to Vercel (2 minutes)

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Enter: `https://github.com/nayrbryangaming/proof-of-play`
4. Configure:
   - **Root Directory:** `app`
   - **Framework:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `out`
5. Environment Variables:
   ```
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
   NEXT_PUBLIC_PROGRAM_ID=3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK
   ```
6. Click "Deploy" → Wait 2-3 minutes

### Step 2: Test Live (3 minutes)

1. Open your Vercel URL: `https://[project-name].vercel.app`
2. Install Phantom wallet (if needed): https://phantom.app/
3. Switch wallet to **Devnet**
4. Get devnet SOL: https://faucet.solana.com/
5. Connect wallet on your site
6. Click "1. INITIALIZE_PDA"
7. Approve transaction
8. See stats appear → **YOU'RE LIVE!**

---

## 🎮 Complete Game Loop (2 Minutes)

1. **Initialize** → Creates your player on-chain
2. **Explore** → Generates random event hash
3. **Fight** → Executes combat math on-chain
4. **Claim** → Restores HP if you won
5. **Repeat** → Infinite progression!

---

## ✅ Verification Checklist

### Prove It's 100% Real:

- [ ] Open Solana Explorer: https://explorer.solana.com/?cluster=devnet
- [ ] Copy transaction signature from your UI logs
- [ ] Paste in Explorer search
- [ ] See your transaction confirmed on-chain
- [ ] Click "Program Logs" → See game logic execution
- [ ] **THIS IS THE PROOF**

### Prove Zero Backend:

- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Play the game
- [ ] Filter by "XHR" requests
- [ ] Only see requests to:
   - `api.devnet.solana.com` (blockchain RPC)
   - `quote-api.jup.ag` (Jupiter swap API)
- [ ] **NO custom backend servers**

### Prove Zero Database:

- [ ] Refresh the page
- [ ] Stats still there (loaded from blockchain)
- [ ] Close browser completely
- [ ] Open again → Stats still there
- [ ] **State persists on Solana, not in database**

---

## 📊 System Status

**Program:** ✅ Deployed to `3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK`  
**Frontend:** ✅ Built and ready to deploy  
**GitHub:** ✅ https://github.com/nayrbryangaming/proof-of-play  
**Vercel:** ⏳ Awaiting your deployment

---

## 🎯 What You're Proving

1. **Fully On-Chain Gaming** - All logic runs in Solana program
2. **Zero Backend** - Static frontend only
3. **Zero Database** - All state in blockchain PDAs
4. **Real-Time** - WebSocket subscriptions + polling
5. **Verifiable** - Every action on Solana Explorer
6. **Infinite** - Unlimited level progression
7. **Deterministic** - Same inputs = same outputs

---

## 📞 Need Help?

**Deployment Issues:**
- Check Vercel build logs
- Verify environment variables
- Ensure `app` is root directory

**Transaction Failures:**
- Confirm wallet on Devnet
- Check SOL balance (need ~0.01 SOL)
- Try different RPC: `https://rpc.ankr.com/solana_devnet`

**Program Not Found:**
- Verify Program ID: `3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK`
- Check network: Must be Devnet
- Try: `solana program show 3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK --url devnet`

---

## 🏆 Success Metrics

**You've succeeded when:**
- ✅ Live URL is accessible
- ✅ Wallet connects
- ✅ Transactions confirm
- ✅ Stats update in real-time
- ✅ Explorer shows your transactions
- ✅ Game loop repeats infinitely

**You can prove:**
- ✅ No backend servers exist
- ✅ No database connections exist
- ✅ All state lives on Solana
- ✅ All logic executes on-chain
- ✅ Everything is verifiable

---

**READY TO DEPLOY. READY TO PROVE. 100% REAL.**

Deploy now: https://vercel.com/new
