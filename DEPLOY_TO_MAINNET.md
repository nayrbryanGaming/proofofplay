# MAINNET DEPLOYMENT GUIDE

To deploy "Proof of Play Dungeon" to the Solana MAINNET (Real Money), follow these exact steps.

> [!CAUTION]
> Mainnet deployment costs REAL SOL. Ensure you have ~1-2 SOL in your wallet.

## 1. Switch to Mainnet
Open `Anchor.toml` and change `[provider]`:

```toml
[provider]
cluster = "mainnet"  # <--- CHANGE THIS
wallet = "~/.config/solana/id.json"
```

## 2. Update RPC
Open `.env.local` and `start_demo.bat` (or your Vercel config):

```bash
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

## 3. Build for Production
Run the deployment script:

```cmd
deploy_prod.bat
```

## 4. Deploy Command (Manual)
If the script fails, run manually:

```bash
solana config set --url mainnet-beta
anchor build
anchor deploy
```

## 5. Verification
- Copy the new **Program ID**.
- Update `lib.rs`, `Anchor.toml`, and `.env.local` with the new ID.
- Re-build and Re-deploy if the ID changed (common in first deploys).

**YOUR PROJECT IS NOW READY FOR THE WORLD.**
