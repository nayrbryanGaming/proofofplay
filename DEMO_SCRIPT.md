# 🎬 Demo Script for Judges (60 seconds)

## Pre-Demo Checklist
- [ ] Wallet connected to Devnet
- [ ] Have ~2 SOL in wallet
- [ ] Vercel URL ready
- [ ] Explorer tab open

---

## Demo Flow (Timed)

### 0:00-0:10 - Introduction (10 seconds)
**SAY:** "This is Proof of Play Dungeon, a demonstration of true on-chain gaming. Zero backend, zero database, all state on Solana."

**DO:** Open Vercel URL in browser

---

### 0:10-0:15 - Show Architecture (5 seconds)
**SAY:** "All game logic lives in an Anchor program. Every action is a transaction."

**DO:** Point to the 4 buttons

---

### 0:15-0:25 - Connect Wallet (10 seconds)
**SAY:** "Real Phantom wallet, Devnet."

**DO:** 
1. Click "Select Wallet"
2. Choose Phantom
3. Approve connection

---

### 0:25-0:35 - Init Player (10 seconds)
**SAY:** "Init Player creates a PDA account on Solana. This is real state, stored on-chain."

**DO:**
1. Click "1. Init Player"
2. Approve transaction
3. **COPY TX SIGNATURE**
4. Show HP/ATK stats populated

---

### 0:35-0:45 - Verify on Explorer (10 seconds)
**SAY:** "Every transaction is verifiable on Solana Explorer."

**DO:**
1. Open new tab: https://explorer.solana.com/?cluster=devnet
2. Paste TX signature
3. Point to Account Data
4. Show PDA address

---

### 0:45-0:52 - Explore & Fight (7 seconds)
**SAY:** "Explore generates an RNG hash on-chain. Fight computes battle using that hash."

**DO:**
1. Click "2. Explore"
2. Wait for confirmation
3. Click "3. Fight"
4. Show battle result in logs

---

### 0:52-0:60 - Metaplex & Jupiter (8 seconds)
**SAY:** "NFT equipment modifies stats—" *point to +3 ATK* "—and Jupiter handles reward swaps. This is full blockchain integration."

**DO:**
1. Point to Inventory panel (Rusty Sword +3 ATK)
2. If won, click "4. Claim Reward"
3. Show Jupiter integration message

---

## Backup Points (if time remains)

- "No GraphQL, no REST API. Just RPC calls to Solana."
- "Deployed on Vercel. Accessible 24/7. No server maintenance."
- "Compare this to traditional games with centralized servers."

---

## If Things Go Wrong

### Wallet won't connect
"Let me use a backup wallet I prepared."

### Transaction fails
"Devnet can be slow. The important part is the architecture—all logic is on-chain."

### Jupiter swap fails on devnet
"Jupiter requires mainnet liquidity. On devnet, the claim instruction still executes—you can verify it on Explorer."

---

## Key Talking Points (Memorize These)

✅ **Zero backend**  
✅ **Zero database**  
✅ **All game logic in Anchor program (256KB of Rust)**  
✅ **All state in PDA accounts**  
✅ **Metaplex integration** (NFT -> gameplay)  
✅ **Jupiter integration** (DeFi rewards)  
✅ **100% verifiable** on Solana Explorer  
✅ **24/7 accessible** via Vercel  

---

## Victory Conditions

✅ Judges understand "on-chain gaming"  
✅ Judges see transaction on Explorer  
✅ Judges see PDA account data  
✅ Judges understand "no backend/database"  

**Time: Under 60 seconds! 🎯**
