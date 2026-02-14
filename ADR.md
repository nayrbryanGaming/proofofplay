# Architectural Decision Records (ADR) - Proof of Play Dungeon

## 1. On-Chain Logic via Anchor
**Decision**: Use Anchor Framework instead of raw Solana Rust.
**Rationale**: 
- **Safety**: Anchor handles account serialization/deserialization and security checks automatically.
- **Speed**: Allows rapid prototyping of the `init`, `explore`, `fight`, `claim` loop.
- **IDL**: Generates an IDL (Interface Description Language) that the frontend needs to communicate with the program without manual ABI mapping.

## 2. State Management via PDAs (Program Derived Addresses)
**Decision**: Store all player state (`hp`, `atk`, `last_event`) in a PDA seeded by `[b"player", user_pubkey]`.
**Rationale**:
- **Deterministic Addressing**: The frontend can always find a user's save file just by knowing their wallet address. No database query needed.
- **Self-Custody**: The user pays the rent for their own state. The game is truly theirs.
- **Composability**: Other programs can read this PDA to interact with the player's stats (e.g., a leaderboard or a PvP extension).

## 3. Infinite Content via Deterministic Entropy
**Decision**: Generate dungeon content by hashing `Slot + BlockHash + UserPubKey`.
**Rationale**:
- **No Oracles**: VRF (Verifiable Random Function) is too slow and expensive for a rapid hackathon loops.
- **Infiniteness**: The blockchain is infinite; therefore, the seed source is infinite.
- **Consistency**: The same inputs always produce the same dungeon, allowing for verifiable gameplay that can be replayed/audited.

## 4. Text-First, PSG1-Style UI
**Decision**: Build the UI as a text-based dashboard first, with an optional graphical overlay.
**Rationale**:
- **Truth**: Text doesn't lie. It shows exactly what is happening on-chain (stats, logs, hashes).
- **Mobile**: Large text and buttons (`p-4`, `text-xl`) are easier to use on mobile devices than complex 3D controls.
- **Resilience**: The game works even if the WebGL context fails or the device is low-power.

## 5. Jupiter & Metaplex Integration
**Decision**: Use Jupiter for claiming and Metaplex for equipment.
**Rationale**:
- **Money Legos**: Demonstrates Solana's composability. We don't build a swap; we use Jupiter. We don't build an item standard; we use Metaplex.
- **Real Value**: Users receive real tokens (SOL/USDC), making the "Proof of Play" distinct from "Play to Earn" points systems.
