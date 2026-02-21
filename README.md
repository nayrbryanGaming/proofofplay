# PROOF OF PLAY
A Protocol-First, Fully On-Chain Gaming System on Solana

### TL;DR
Proof of Play is not a game studio project.
It is an on-chain execution system that proves gameplay can run without servers, databases, or trust assumptions.

- Every player action is a Solana transaction.
- Every state transition is public.
- The frontend is disposable.
- The blockchain is the engine.

---

### What This Project Actually Is
Proof of Play is a production-grade reference implementation for on-chain gaming. It demonstrates how to:
- Execute gameplay logic entirely inside a Solana program
- Persist player state exclusively in PDAs
- Use NFTs as functional game components, not images
- Settle rewards trustlessly via DeFi
- Run a live game 24/7 without backend infrastructure

The “Dungeon” UI is intentionally minimal. The architecture is the product.

### What This Project Is NOT
❌ Not a Web2 game with wallet login
❌ Not a backend-driven simulation
❌ Not a graphics showcase
❌ Not dependent on servers, APIs, or databases
❌ Not reliant on off-chain computation

If the frontend disappears, the game still exists.

---

### Core Architecture (Single Source of Truth)
**User Action** → **Next.js Frontend** (Static, Stateless) → **Solana Transaction** → **Anchor Program** (Game Logic) → **Player PDA** (Persistent State)

There is no alternative execution path.

---

### On-Chain Guarantees
This system guarantees that:
- Every game action is verifiable on Solana Explorer
- Game logic cannot be altered post-deployment
- Player state cannot be forged or reset
- Rewards cannot be double-claimed
- No admin keys can intervene in gameplay

Trust is replaced by verification.

---

### Live Game Loop (No Shortcuts)
1. **Initialize Player**: Creates a Player PDA on Solana
2. **Equip NFT (Metaplex)**: Reads on-chain metadata and applies stat modifiers
3. **Explore**: Generates deterministic entropy using on-chain inputs
4. **Fight**: Combat resolution executed in Rust inside Anchor
5. **Claim Reward (Jupiter)**: Trustless token settlement to the player wallet

Every step = one blockchain transaction.

---

### Why This Matters
Most “on-chain games” today still rely on:
- Backend servers
- Private databases
- Hidden game logic
- Manual admin controls

Proof of Play removes all of that. This is blockchain-native execution, not blockchain-assisted UX.

---

### Technology Stack (Minimal by Design)
**On-Chain**
- Solana
- Anchor
- Program Derived Accounts (PDAs)

**Assets**
- Metaplex UMI SDK
- NFTs as stat-bearing equipment

**DeFi**
- Jupiter V6
- Reward settlement via swaps

**Frontend**
- Next.js
- Wallet Adapter
- Static deployment on Vercel

No backend languages. No PHP. No databases. No cron jobs.

---

### Deployment Model
- Anchor program deployed to Solana Devnet
- Frontend deployed to Vercel (static)
- Environment variables define: Program ID, RPC endpoint, Optional test NFT mint

The system runs continuously without operators.

---

### Security Posture
- Authority validation
- Stat bounds enforcement
- Replay protection
- Double-claim prevention
- Deterministic combat resolution
- Explicit failure handling

There are no privileged backdoors.

---

### Operational Reality
This project is:
- Publicly auditable
- Forkable by other developers
- Composable with other Solana protocols
- Suitable as a base layer for new games

It is infrastructure, not content.

---

### Intended Audience
- Solana core developers
- On-chain game builders
- Protocol designers
- Infrastructure-focused judges

If you are optimizing for visuals, this is not for you. If you are optimizing for truth, it is.

---

### Why PSG1-First
- Portrait-first interface
- Large interaction targets
- Stateless frontend
- Designed for short, repeatable sessions
- Hardware-agnostic execution

This is how blockchain-native games run on mobile hardware.

---

### What This Proves
- Games can execute fully on-chain
- State does not require databases
- Logic does not require servers
- Transparency does not reduce performance
- Infrastructure can be simple and unstoppable

---

### Final Statement
Proof of Play is not about how games look. It is about what games are allowed to be when trust is removed and execution is absolute.

**No backend. No database. No excuses. Just chain.**
