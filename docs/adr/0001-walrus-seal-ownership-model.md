# ADR 0001: Walrus Canonical Storage + Wallet Ownership Model

## Status
Accepted

## Context
The Walrus Sessions hackathon project requires:
- public respondents to submit without wallet friction,
- form owners/admins to use Sui wallet ownership for secure access,
- canonical submission and asset persistence on Walrus,
- support for sensitive-field encryption with Seal.

The product also needs operational dashboard features (search/filter/notes/priorities/export) that are inefficient to compute directly from blob storage.

## Decision
1. **Canonical evidence lives on Walrus**  
   Submission payloads and uploaded assets are written to Walrus blobs. Each local submission record stores Walrus references (`blobId`, size, metadata, and fetch URL).

2. **Local DB is an index + workflow layer**  
   SQLite (Prisma) stores form metadata, ownership, searchable submission excerpts, status/priority, and admin notes. This improves speed for dashboard operations while preserving Walrus as source of truth for evidence payload.

3. **Ownership is wallet-address based**  
   Forms are owned by a Sui address. Admin-only operations are authorized by an HTTP-only session cookie issued after wallet signature verification.

4. **Sensitive fields are isolated**  
   Form schema marks fields as public vs sensitive. Sensitive responses are encrypted before Walrus write and persisted as encrypted payload references + metadata. Sensitive asset references are also split by schema and included in sensitive payloads. Decrypt paths use a Seal abstraction and wallet session inputs.

5. **Decryption is environment aware**  
   Full Seal decrypt requires network/package/key-server configuration. The app ships real integration interfaces and guarded runtime checks. If env is incomplete, the UI remains honest and actionable.

6. **Admin form creation is session-gated**  
   Form creation requires a verified wallet session. Public submissions remain walletless.

## Consequences
- Public submission is frictionless while still producing immutable-like evidence references.
- Admin workflows remain fast and queryable without violating canonical storage constraints.
- Wallet signature auth is lightweight and hackathon-feasible without introducing full custodial auth complexity.
- The Seal flow is real and extensible, but may require explicit environment setup to fully decrypt in all environments.
