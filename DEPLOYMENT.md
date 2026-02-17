# Proof of Play - Deployment Guide

## 🚀 PRODUCTION DEPLOYMENT STEPS

### 1. GitHub Repository
Repository: https://github.com/[your-username]/proof_of_play

### 2. Vercel Deployment

**Option A: Automatic Deployment (Recommended)**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `app`
   - **Build Command:** `npm run build`
   - **Output Directory:** `out`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
   NEXT_PUBLIC_PROGRAM_ID=3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK
   NEXT_PUBLIC_EQUIP_MINT=MINT_ADDRESS_HERE
   ```
5. Click "Deploy"

**Option B: Vercel CLI**
```bash
cd app
npm install -g vercel
vercel --prod
```

### 3. Verify Deployment

Once deployed, test the following:

1. **Wallet Connection**
   - Open live URL
   - Click "Connect Wallet"
   - Switch wallet to Devnet
   - Confirm connection succeeds

2. **Initialize Player**
   - Click "1. INITIALIZE_PDA"
   - Approve transaction in wallet
   - Wait for confirmation
   - Verify player stats appear

3. **Complete Game Loop**
   - Click "2. EXPLORE_DUNGEON"
   - Click "3. FIGHT_MONSTER"
   - If victory, click "4. CLAIM_LOOT"
   - Repeat infinitely

4. **Verify On-Chain**
   - Copy transaction signatures from logs
   - Open https://explorer.solana.com/?cluster=devnet
   - Paste signature
   - Verify transaction details

### 4. Generate Proof Links

For each transaction, create proof documentation:

```markdown
## Transaction Proofs

### 1. Player Initialization
- **Signature:** [paste signature]
- **Explorer:** https://explorer.solana.com/tx/[signature]?cluster=devnet
- **PDA Created:** [player PDA address]
- **Initial State:** HP=100, ATK=10, DEF=5, Level=1

### 2. Explore Dungeon
- **Signature:** [paste signature]
- **Explorer:** https://explorer.solana.com/tx/[signature]?cluster=devnet
- **Event Hash:** [32-byte hash]

### 3. Fight Monster
- **Signature:** [paste signature]
- **Explorer:** https://explorer.solana.com/tx/[signature]?cluster=devnet
- **Result:** Victory/Defeat
- **New Level:** [level number]

### 4. Claim Reward
- **Signature:** [paste signature]
- **Explorer:** https://explorer.solana.com/tx/[signature]?cluster=devnet
- **HP Restored:** +20
```

---

## 🎯 SUCCESS CRITERIA

### Technical Validation
- ✅ Live URL accessible 24/7
- ✅ No backend servers running
- ✅ No database connections
- ✅ All state queries go to Solana RPC
- ✅ All mutations are transactions
- ✅ Real-time updates via WebSocket

### Functional Validation
- ✅ Wallet connects successfully
- ✅ All 5 instructions executable
- ✅ Transactions confirm on devnet
- ✅ State persists across sessions
- ✅ Infinite level progression works

### Architectural Validation
- ✅ Frontend is stateless viewer
- ✅ Game survives UI disappearance
- ✅ All logic verifiable on Explorer
- ✅ Deterministic gameplay
- ✅ Zero trust assumptions

---

## 🔗 LIVE DEMO CHECKLIST

Before presenting to stakeholders:

- [ ] Live URL is accessible
- [ ] Wallet connection works
- [ ] Complete one full game loop
- [ ] Generate 5+ transaction proofs
- [ ] Verify all Explorer links work
- [ ] Test on mobile device
- [ ] Confirm real-time updates
- [ ] Document any limitations

---

## 📊 PROGRAM INFORMATION

**Program ID:** `3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK`  
**Network:** Solana Devnet  
**Framework:** Anchor 0.32.1  
**Language:** Rust  

**Instructions:**
1. `init_player` - Create player PDA
2. `explore` - Generate deterministic event hash
3. `fight` - Execute combat logic on-chain
4. `claim` - Process reward settlement
5. `equip` - Apply NFT stat bonuses

**Account Structure:**
```rust
pub struct Player {
    pub authority: Pubkey,    // Wallet owner
    pub hp: u8,               // Health points
    pub atk: u8,              // Attack power
    pub def: u8,              // Defense
    pub last_event: [u8; 32], // Event hash
    pub can_claim: bool,      // Reward flag
    pub level: u32,           // Current level
}
```

---

## 🎮 GAMEPLAY MECHANICS

### Deterministic RNG
```rust
let seeds = &[
    &slot[..],           // Current blockchain slot
    &timestamp[..],      // Unix timestamp
    &authority[..],      // Player wallet
    &old_state[..],      // Previous event hash
    &player.hp.to_le_bytes(),
    &player.level.to_le_bytes(),
];
let event_hash = hashv(seeds).0;
```

### Combat Math
```rust
// Monster stats derived from hash
let monster_hp = (hash[0] % 30) + 20 + (level * 5);
let monster_atk = (hash[1] % 10) + 5 + (level * 2);
let monster_def = (hash[2] % 5) + (level / 2);

// Damage calculation
let player_dmg = player.atk.saturating_sub(monster_def).max(1);
let monster_dmg = monster_atk.saturating_sub(player.def).max(1);

// Victory condition
if rounds_to_kill <= rounds_to_die {
    player.level += 1;
    player.can_claim = true;
}
```

---

## 🏆 PROTOCOL ACHIEVEMENTS

This implementation proves:

1. **Fully On-Chain Gaming** - All logic executes in Solana program
2. **Zero Backend** - Static frontend only
3. **Zero Database** - All state in PDAs
4. **Real-Time Updates** - WebSocket + polling
5. **Infinite Scalability** - Unlimited level progression
6. **Deterministic Gameplay** - Same inputs = same outputs
7. **Verifiable Truth** - Every action on Explorer

**This is not a demo. This is a protocol.**

---

## 📞 SUPPORT

If deployment fails:
1. Check Vercel build logs
2. Verify environment variables
3. Confirm RPC endpoint accessible
4. Test wallet on devnet
5. Check program deployment status

For program issues:
```bash
# Verify program exists
solana program show 3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK --url devnet

# Check account
solana account [PDA_ADDRESS] --url devnet
```

---

**READY TO DEPLOY. READY TO PROVE. 100% REAL.**
