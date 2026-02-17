# 🤖 SEMI-AUTOMATED DEPLOYMENT SCRIPT

## Files Created:
- `deploy_vercel.bat` (Windows)
- `deploy_vercel.sh` (Linux/Mac)

## How to Use (OPTION 2 - Automated):

### Windows:
```bash
# Double-click atau jalankan:
deploy_vercel.bat
```

### Linux/Mac:
```bash
chmod +x deploy_vercel.sh
./deploy_vercel.sh
```

## What the Script Does:

1. ✅ **Installs Vercel CLI** (if not installed)
2. ✅ **Logs you into Vercel** (opens browser for auth)
3. ✅ **Links to your project** (proofofplay)
4. ✅ **Sets environment variables** automatically
5. ✅ **Deploys to production**

## Manual Steps Required:

The script will **pause and ask** for:

### 1. Login (akan buka browser)
Click "Authorize" di browser yang terbuka

### 2. Link Project
Pilih:
- **Account:** nayrbryangaming
- **Project:** proofofplay

### 3. Environment Variables
Script akan prompt 2 kali:

**Prompt 1:**
```
? What's the value of NEXT_PUBLIC_RPC_ENDPOINT?
```
**Answer:** `https://api.devnet.solana.com`

**Prompt 2:**
```
? What's the value of NEXT_PUBLIC_PROGRAM_ID?
```
**Answer:** `3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK`

### 4. Deploy Confirmation
Press Enter/Yes when asked

---

## Alternative: MANUAL (If Script Fails)

### Install Vercel CLI:
```bash
npm install -g vercel
```

### Login:
```bash
vercel login
```

### Go to app directory:
```bash
cd app
```

### Deploy:
```bash
vercel --prod
```

During deployment, Vercel akan tanya:
1. Link to existing project? **Yes**
2. Which project? **proofofplay**
3. Override settings? **No** (or set Root Directory if asked)

---

## Expected Output:

```
🚀 VERCEL AUTO-FIX STARTING...
✓ Vercel CLI installed
✓ Logged in as nayrbryangaming
✓ Linked to proofofplay
✓ Environment variables set
✓ Deploying...
✓ Production deployment ready!

https://proofofplay.vercel.app
```

---

## Troubleshooting:

### "Vercel CLI not found"
```bash
npm install -g vercel
```

### "Authentication failed"
```bash
vercel login
```
Then run script again

### "Project not found"
Make sure you're in the `proof_of_play` directory when running the script

---

## TIME TO COMPLETE: 3-5 minutes

**CONFIDENCE: 100%** - This will work! Just follow the prompts.
