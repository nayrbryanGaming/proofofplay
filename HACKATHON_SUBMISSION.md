# 🏆 THE MATRIX HACKATHON - SUBMISSION GUIDE

**Project Name:** Proof of Play Protocol (Reference Implementation: The Dungeon)
**Tagline:** A serverless, verification-first protocol for on-chain gaming state and rewards.

---

## 🎯 Track Applications & Strategy

We are submitting to the following tracks based on our **Protocol-First** architecture:

### 1. PSG1-first Track by Play Solana 🎮
**Protocol Fit:**
- **Zero-Install Gaming:** Our protocol runs entirely in the browser, making it the lightest possible gaming stack for PSG1.
- **Form-Factor Native:** The reference UI demonstrates how complex on-chain interactions (Init, Play, Claim) can be abstracted into a simple, portrait-first "Big Button" interface ideal for handhelds.

### 2. Gamification, DeFi & Mobile Adventures by Jupiter 🪐
**Protocol Fit:**
- **Invisible DeFi Layer:** We don't just "add a swap button." Our protocol *embeds* Jupiter V6 swaps directly into the game loop as the reward mechanism.
- **Play-to-Swap:** Validates a new model where gameplay outcomes trigger immediate, programmed DeFi actions without user context-switching.

### 3. On-chain Assets & Programmable Gaming Infrastructure by Metaplex 💎
**Protocol Fit:**
- **Functional Metadata Standard:** We demonstrate a standard for using Metaplex NFT metadata as *executable game logic* (e.g., ATK stats) rather than just passive display assets.
- **State-Driven Assets:** The protocol validates asset ownership and attributes on-chain before allowing gameplay actions.

---

## 📝 Project Description (Judges' Edition)

**Proof of Play** is NOT just a game. It is a **reference implementation for a serverless, verification-first gaming protocol** on Solana.

Most on-chain games rely on "Web2.5" architectures: centralized servers for logic, databases for state, and blockchain only for assets. This creates fragility, censorship risk, and high infrastructure costs.

**Proof of Play solves this by demonstrating a 100% on-chain stack:**

1.  **Serverless Logic:** Game rules are enforced exclusively by an Anchor program, not a backend API.
2.  **PDA-Based State:** Player progress is stored in Program Derived Addresses, eliminating independent databases.
3.  **Verifiable History:** Every gameplay action (Explore, Fight, Loot) is a cryptographic transaction, creating an immutable "Proof of Play" ledger.
4.  **DeFi-Native Rewards:** Rewards are programmatically swapped via Jupiter, not distributed from a centralized hot wallet.

**The "Dungeon" game you see is merely the frontend for this protocol.** It proves that complex, interactive gameplay loops can exist entirely on Solana, offering a blueprint for the next generation of unstoppable games.

---

## 🔗 Repository Links

- **Live Demo Protocol:** [Insert Vercel Link Here]
- **Protocol Source:** [GitHub Link]

---

## 🛠 Tech Stack (The "Infra" Stack)

- **Protocol Layer:** Anchor (Rust)
- **State Layer:** Solana PDAs
- **Asset Layer:** Metaplex UMI
- **Liquidity Layer:** Jupiter V6 API
- **Interface Layer:** Next.js (Vercel)

---

## 📸 Proof of Concept

*(Include screenshots of the "Transaction History" panel showing the immutable ledger of gameplay actions)*
