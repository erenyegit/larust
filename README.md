# Larust

> 🎥 video: https://www.youtube.com/watch?v=h5GFiSFPN_U****


**Feedback that lasts. Evidence that proves.**

Larust is a Walrus-native feedback + form platform built for the Walrus Sessions hackathon. It combines:
- frictionless public submissions (no wallet required),
- wallet-based admin ownership and access,
- canonical Walrus storage for submissions/assets,
- Seal encryption support for sensitive fields,
- operational dashboard workflows (filter, priority, notes, export).

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style UI primitives
- Sui dApp Kit (wallet connection + signing)
- `@mysten/walrus` + publisher/aggregator integration
- `@mysten/seal` abstraction for sensitive-field encryption/decryption
- Prisma + SQLite for indexing, workflow metadata, and dashboard speed
- Zod validation + TanStack Query
- Vitest tests for core validation/splitting logic

## Quick Start

1) Install dependencies:

```bash
npm install
```

2) Configure env:

```bash
cp .env.example .env
```

3) Initialize DB and seed:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4) Run:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Runtime Verification

With `next dev` running, execute:

```bash
npm run verify:runtime
```

This script validates:
- authenticated form creation,
- slug/public lookup,
- image + video asset uploads,
- canonical submission write,
- owner-protected API behavior,
- notes/status/priority updates,
- CSV/JSON export,
- Walrus blob retrievability.

## Environment Variables

Required:
- `DATABASE_URL`
- `AUTH_SESSION_SECRET` (strong random secret in non-local environments)

Walrus defaults are testnet-ready but should be verified for your deployment:
- `WALRUS_FULLNODE_URL`
- `WALRUS_UPLOAD_RELAY_URL`
- `WALRUS_PUBLISHER_URL`
- `WALRUS_AGGREGATOR_URL`
- `WALRUS_STORAGE_EPOCHS`
- `WALRUS_SERVICE_PRIVATE_KEY` (optional; enables signer-based writes via SDK)

Seal (optional but supported):
- `SEAL_PACKAGE_ID`
- `SEAL_THRESHOLD`
- `SEAL_KEY_SERVERS`
- `NEXT_PUBLIC_SEAL_PACKAGE_ID`
- `NEXT_PUBLIC_SEAL_THRESHOLD`
- `NEXT_PUBLIC_SEAL_KEY_SERVERS`

Sui wallet/dApp:
- `NEXT_PUBLIC_SUI_NETWORK`
- `NEXT_PUBLIC_SUI_RPC_URL`
- `NEXT_PUBLIC_APP_URL`

## Architecture Notes

- Canonical evidence (submission payload + uploaded files) is stored on Walrus.
- Local SQLite indexes submissions for fast filtering/searching/triage.
- Sensitive fields are split from public fields at submit time.
- Sensitive asset refs are split by field sensitivity before persistence.
- If Seal env config is present, sensitive values are encrypted before canonical storage write.
- Export endpoints include local triage metadata plus Walrus references.

## Companion Docs

- [SUBMISSION.md](SUBMISSION.md) — single source of truth for the hackathon submission.
- [PITCH.md](PITCH.md) — narrative & positioning.
- [DEMO.md](DEMO.md) / [DEMO-CHECKLIST.md](DEMO-CHECKLIST.md) — 3-minute walkthrough script.
- [VERIFY.md](VERIFY.md) — end-to-end runtime verification protocol.
- [SCREENSHOTS.md](SCREENSHOTS.md) — capture plan (output → `public/screenshots/`).
- [CONTEXT.md](CONTEXT.md) and [docs/adr/0001-walrus-seal-ownership-model.md](docs/adr/0001-walrus-seal-ownership-model.md) — context & key architectural decision.

## What Is Env-Dependent

- **Live wallet UX** requires a Sui wallet extension in browser for signing.
- **Full Seal decrypt path** requires valid `SEAL_PACKAGE_ID` and `SEAL_KEY_SERVERS`, plus session key + tx bytes from a real approved flow.
- **Client-side Seal encryption path** requires `NEXT_PUBLIC_SEAL_*` variables (public package/key-server metadata).
- **Walrus signer flow** via SDK requires funded `WALRUS_SERVICE_PRIVATE_KEY`; otherwise publisher flow is used.

## Checks

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```
