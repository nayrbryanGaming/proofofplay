# PROOF OF PLAY DUNGEON - 60-SECOND DEMO SCRIPT

## 0:00 - 0:10 | THE "HOOK"
**Action:** Open Landing Page (Vercel URL) with Wallet Disconnected.
**Say:** "This isn't just a game. It's 'Proof of Play Dungeon'—a fully on-chain, infinite procedural world running 100% on Solana. Zero backend. Zero database."

## 0:10 - 0:25 | VERIFIABLE ENTRANCE
**Action:** Connect Wallet -> Click [1. INITIALIZE_PDA].
**Say:** "Every player state is a PDA. I'm initializing my character on-chain right now."
*(Point to the Transaction Hash log)*
**Say:** "See that? Real-time verification. No cloud servers faking it."

## 0:25 - 0:40 | INFINITE GAMEPLAY & REAL-TIME SYNC
**Action:** Click [2. EXPLORE_DUNGEON] -> Watch logs update instantly.
**Say:** "Notice the UI updates instantly? That's our WebSocket architecture listening to on-chain PDA changes in real-time. No manual refresh."

**Action:** Click [3. FIGHT_MONSTER].
**Say:** "I explore and fight. The dungeon generation is deterministic, derived from block hashes..."
*(Toggle [ VISUAL_MODE ] ON briefly)*
**Say:** "And yes, we have 4K procedural graphics, generated purely from code—no assets."

## 0:40 - 0:50 | THE REWARD (JUPITER)
**Action:** If won, click [4. CLAIM_LOOT ($)].
**Say:** "Loot isn't just points. It's real crypto. We use Jupiter Aggregator to instantly swap dungeon rewards into USDC."

## 0:50 - 0:60 | CLOSING
**Action:** Show 'Transaction History' panel.
**Say:** "Mobile-first. Unstoppable. Verifiable. This is the future of on-chain gaming. Thank you."

---

## SETUP FOR DEMO
1. Ensure your Phantom wallet is on **Devnet**.
2. Ensure you have ~0.5 SOL (airdrop if needed).
3. Access: `https://proof-of-play-dungeon.vercel.app` (or your deployment).
