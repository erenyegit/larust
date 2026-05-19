# Demo Checklist

## 1) Environment Variables Required

Minimum:
- `DATABASE_URL`
- `AUTH_SESSION_SECRET`
- `NEXT_PUBLIC_SUI_NETWORK`
- `NEXT_PUBLIC_SUI_RPC_URL`
- `WALRUS_FULLNODE_URL`
- `WALRUS_UPLOAD_RELAY_URL`
- `WALRUS_PUBLISHER_URL`
- `WALRUS_AGGREGATOR_URL`

Optional (advanced paths):
- `WALRUS_SERVICE_PRIVATE_KEY`
- `SEAL_PACKAGE_ID`
- `SEAL_KEY_SERVERS`
- `SEAL_THRESHOLD`
- `NEXT_PUBLIC_SEAL_PACKAGE_ID`
- `NEXT_PUBLIC_SEAL_KEY_SERVERS`
- `NEXT_PUBLIC_SEAL_THRESHOLD`

## 2) Wallet / Network Prerequisites
- Install and unlock a Sui wallet extension.
- Set wallet network to match app config (typically testnet).
- Ensure wallet has connectivity for signature prompts.

## 3) Seed / Reset Steps (clean state)
```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

## 4) Start App
```bash
npm run dev
```

## 5) Clean 3-Minute Click Path
1. Open `/` and deliver positioning in one sentence.
2. Go to `/create`.
3. Verify wallet session from header.
4. Select Bug Report template, toggle one field to sensitive, publish.
5. Open generated public link.
6. Submit realistic issue with screenshot/video evidence.
7. Show `/f/success` receipt with Walrus blob reference.
8. Open `/dashboard` and `/dashboard/forms/[id]`.
9. Apply one filter, open a submission, add note, set priority.
10. Trigger JSON and CSV export.

## 6) Fallback If Seal Live Decrypt Is Unavailable
- Do not fake decrypt.
- State clearly:
  - Sensitive routing and encryption paths are implemented.
  - Live decrypt requires external Seal package/key-server/session-key configuration.
- Show proof already available:
  - sensitive markers in schema and UI,
  - encrypted metadata surfaces,
  - Walrus canonical references,
  - owner-gated admin routes.

## 7) Final Confidence Checks Before Going Live
```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run verify:runtime
```
