# Larust Context

## Product Intent
Larust is a Walrus-native feedback vault for teams that need structured customer evidence, not just form responses. It combines a frictionless public submission flow (no wallet required) with wallet-gated admin ownership for secure triage and sensitive data workflows.

## Primary Users
- **Respondent:** submits bug reports, feature requests, surveys, and research feedback quickly.
- **Form Owner/Admin:** connects a Sui wallet to create forms, manage submissions, prioritize work, and decrypt sensitive records.

## Core UX Principles
- Public flow feels Web2 smooth: minimal cognitive load, clear progress, fast upload feedback.
- Admin flow feels operational and trustworthy: rich filtering, triage metadata, notes, export.
- Cryptographic story is explicit but understandable: Walrus for canonical evidence storage, Seal for sensitive data handling.
- Visual language follows an "abyssal research instrument" direction: premium, restrained motion, editorial spacing.

## System Responsibilities
- Schema-driven form definition and renderer.
- Canonical storage of response payloads and assets on Walrus.
- Local relational index for fast dashboard operations (status, priority, notes, filters).
- Optional Seal encryption/decryption for sensitive fields.
- Wallet-based ownership and admin session model.
- Public and sensitive asset references are separated by field sensitivity before persistence.

## Demo Expectations
- Includes starter templates and seeded records for a live-looking dashboard.
- Graceful degradation when Walrus/Seal environment variables are absent.
- Production-like quality for design, interaction states, validation, and reliability.
