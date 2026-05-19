# Larust - Hackathon Submission

## Project Name
**Larust**

## One-Sentence Pitch
Larust is a Walrus-native feedback vault that turns public form responses into verifiable product evidence, with Seal-protected sensitive data and wallet-gated admin operations.

## Problem
Product teams collect feedback across scattered tools, screenshots, and chat threads, then lose trust in what is complete, canonical, or secure. Traditional form tools optimize collection, not evidence integrity, sensitive-data handling, or triage accountability.

## Solution
Larust provides a full feedback operations loop:
- schema-driven form creation for bug reports, feature requests, surveys, and custom intake,
- frictionless no-wallet public submissions,
- canonical Walrus storage for payloads and media evidence,
- Seal-based protection for sensitive sections,
- owner-gated triage workflows with notes, priority, filtering, and export.

## Why Walrus Is Essential
Walrus is the canonical evidence layer in Larust:
- submission payloads and uploaded assets are persisted as Walrus blobs,
- each triage record carries a durable Walrus reference,
- admins can export datasets with canonical blob IDs for auditability and downstream workflows.

Without Walrus, this is another form app. With Walrus, it becomes an evidence vault.

## How Seal Is Used
Larust marks sensitive fields at schema level and isolates them from public fields:
- client-side Seal encryption path runs when `NEXT_PUBLIC_SEAL_*` is configured,
- server-side fallback path is implemented for constrained environments,
- decrypt route is implemented for session-key + tx-bytes flows in admin contexts.

## Why No-Wallet Respondent Flow Matters
Most users submitting feedback are not wallet users. Forcing wallet connection reduces response volume and quality. Larust keeps respondent UX Web2-smooth while preserving Web3-grade verifiability for storage and admin governance.

## Key Features
- Landing, create studio, public form, success receipt, dashboard, and per-form triage views.
- Templates: Bug Report, Feature Request, Survey.
- Field support: short text, rich text, dropdown, checkbox group, star rating, URL, image upload, video upload.
- Add/remove/reorder fields with required/sensitive/options/helper config.
- Walrus-backed asset + submission storage.
- Sensitive split with Seal integration path.
- Sui wallet session verification for admin ownership.
- Triage filters, notes, status/priority controls, and JSON/CSV export.

## Architecture Summary
- **Frontend:** Next.js App Router + Tailwind + TypeScript.
- **Data model:** Prisma + SQLite index for fast operational querying.
- **Canonical storage:** Walrus service layer for payloads/media.
- **Security:** Seal service/client paths for sensitive encryption/decrypt integration points.
- **Auth model:** wallet signature verification -> HTTP-only admin session cookie.
- **Separation:** public vs sensitive values/assets split before persistence.

## What Is Fully Working
- End-to-end form creation and public submission flow.
- All required input types and media uploads.
- Walrus upload path with canonical references.
- Per-form submission organization.
- Owner-protected admin APIs and dashboard triage.
- Notes/status/priority persistence.
- CSV and JSON export.
- Runtime verification script proving core paths.

## What Is Env-Dependent
- Live wallet signing UX requires a browser Sui wallet extension.
- Full Seal decrypt requires valid Seal network/package/key-server configuration and session key inputs.
- SDK signer-based Walrus writes require funded `WALRUS_SERVICE_PRIVATE_KEY` (publisher path works without it).

## Why This Project Should Win
Larust is not a template-level demo. It solves a real product-ops pain point with a credible architecture:
- frictionless collection for real users,
- cryptographically grounded evidence storage,
- sensitive-data-aware workflows,
- and a polished operator experience that judges can verify live in minutes.
