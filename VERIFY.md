# Verification Matrix

Legend:
- **complete**: implemented and verified in runtime or tests
- **partial**: implemented but missing part of requirement
- **env-dependent**: real flow implemented but requires external config/wallet context

| Feature | Status | Proof (route + files) | Notes |
|---|---|---|---|
| Landing page with premium messaging | complete | `/`, `src/app/page.tsx`, `src/components/magic/*` | Rebuilt design system around abyssal editorial direction. |
| Form creation studio | complete | `/create`, `src/components/forms/form-builder.tsx`, `src/app/api/forms/route.ts` | Runtime-verified form creation via authenticated cookie in `scripts/runtime-verify.mjs`. |
| Templates (Bug Report, Feature Request, Survey) | complete | `src/lib/templates.ts` | Used in studio template selector. |
| Add/remove/reorder fields | complete | `src/components/forms/form-builder.tsx` | Up/down + remove controls present and persisted in schema. |
| Field config label/description/placeholder/required/sensitive/options/helper | complete | `src/components/forms/form-builder.tsx`, `src/lib/validation.ts`, `src/types/forms.ts` | Helper copy added and rendered. |
| Input types short/rich/dropdown/checkbox/rating/url/image/video | complete | `/f/[slug]`, `src/components/forms/form-renderer.tsx` | Runtime verification script submits all field types. |
| Public submit without wallet | complete | `/f/[slug]`, `src/app/api/submissions/route.ts` | No wallet/session required for submission endpoint. |
| Sui wallet admin session flow | env-dependent | `src/components/wallet-session.tsx`, `src/app/api/auth/*`, `src/lib/auth.ts` | Runtime owner checks verified with signed session cookie; live wallet popup flow requires browser wallet. |
| Walrus storage for assets | complete | `/api/assets`, `src/lib/services/walrus.ts`, `scripts/runtime-verify.mjs` | Runtime script uploaded image/video and fetched blobs from Walrus aggregator (HTTP 200). |
| Walrus storage for submissions | complete | `/api/submissions`, `src/lib/services/submissions.ts`, `scripts/runtime-verify.mjs` | Runtime script got canonical submission blob ID and Walrus URL. |
| Submissions organized per form | complete | `/api/forms/[id]/submissions`, `src/app/dashboard/forms/[id]/page.tsx` | Runtime script created form and retrieved exactly that form’s submissions. |
| Sensitive field encryption path (Seal) | env-dependent | `src/lib/services/seal-client.ts`, `src/lib/services/seal.ts`, `/api/seal/decrypt`, `src/components/forms/form-renderer.tsx` | Client-side Seal encryption runs when `NEXT_PUBLIC_SEAL_*` is configured; server fallback exists; decrypt requires session key + tx bytes. |
| Sensitive assets split from public assets | complete | `src/lib/services/submission-utils.ts`, `src/app/api/submissions/route.ts` | Sensitive asset references separated by field sensitivity and routed into sensitive payload. |
| Admin dashboard list + ownership protection | complete | `/dashboard`, `/dashboard/forms/[id]`, `src/lib/server-authz.ts`, API routes | Unauthorized runtime probes return 401; authorized probes succeed. |
| Filters/search in triage | complete | `src/components/dashboard/submissions-table.tsx`, `src/components/dashboard/filter-submissions.ts`, `src/components/dashboard/filter-submissions.test.ts` | Filter logic unit-tested (status/priority/rating/date/keyword). |
| Notes/status/priority persistence | complete | `/api/submissions/[id]`, `/api/submissions/[id]/notes`, `scripts/runtime-verify.mjs` | Runtime script PATCHed status/priority and persisted note. |
| Export JSON and CSV | complete | `/api/forms/[id]/export`, `src/app/api/forms/[id]/export/route.ts`, `scripts/runtime-verify.mjs` | Runtime script got 200 for both JSON and CSV export. |
| Success and empty/loading/error states | complete | `src/components/forms/form-renderer.tsx`, `src/components/dashboard/submissions-table.tsx`, `src/app/f/success/page.tsx` | Explicit empty/loading/error messaging implemented. |
| Mobile responsiveness baseline | complete | `src/app/page.tsx`, `src/app/create/page.tsx`, `src/app/dashboard/*` | Uses responsive grids and stacked layouts; manually review on device for final QA. |

## Runtime Verification Command

```bash
npm run verify:runtime
```

Last verified output includes:
- created form + slug
- uploaded image/video blob IDs
- created submission blob ID
- unauthorized admin endpoints returning `401`
- authorized exports returning `200`
- Walrus blob fetch returning `200`

## Test/Build Verification

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

All pass on current codebase.
