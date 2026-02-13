# ARCHITECTURE DECISION RECORD (ADR) 001

## Title
Use of Vercel for Frontend Distribution

## Context
The project adheres to a strict "No Backend" and "On-Chain Only" philosophy. The user has questioned whether deploying to Vercel violates this.

## Decision
**We will deploy the Next.js frontend to Vercel.**

## Justification
1. **Stateless Nature:** Vercel is used strictly for hosting static assets (HTML/JS/CSS). No server-side logic (Lambdas/Edge Functions) is employed for game mechanics.
2. **Hackathon Requirements:** Judges require a publicly accessible URL for verification.
3. **Consistency:** The original project specification explicitly requested Vercel deployment.

## Future Mitigation
To achieve 100% decentralization (The "God Tier" Goal), the frontend artifact can be deployed to Arweave or IPFS in a future phase.

## Status
ACCEPTED
