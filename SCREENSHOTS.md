# Screenshot Capture Checklist

Capture with clean seeded data (`npm run db:seed`) and wallet session verified.
Save the resulting PNGs into [`public/screenshots/`](public/screenshots/) using the numbered slug suggested below (e.g. `01-hero.png`). They are referenced in `SUBMISSION.md` and served statically from `/screenshots/*`.

## 1) Hero + Value Proposition
- **Page:** `/`
- **Viewport:** 1440x900
- **Proves:** Distinct brand, clear positioning, immediate Walrus/Seal narrative.

## 2) Evidence Preview Panel
- **Page:** `/`
- **Viewport:** 1440x900 (scroll slightly)
- **Proves:** Product feels operational, not template; visible Walrus refs and Seal indicators.

## 3) Walrus + Seal Architecture Card
- **Page:** `/`
- **Viewport:** 1440x900
- **Proves:** Architecture is understandable at a glance (stored vs encrypted vs indexed).

## 4) Form Studio Builder
- **Page:** `/create`
- **Viewport:** 1440x900
- **Proves:** Schema-driven builder with reorder, required/sensitive controls, helper copy.

## 5) Public Form Trust Strip + Inputs
- **Page:** `/f/[slug]` (demo form)
- **Viewport:** 1280x900
- **Proves:** No-wallet intake + visible Walrus/Seal trust cues + rich field support.

## 6) Media Upload In Progress
- **Page:** `/f/[slug]`
- **Viewport:** 1280x900
- **Proves:** Screenshot/video evidence upload UX and Walrus storage messaging.

## 7) Success Receipt
- **Page:** `/f/success`
- **Viewport:** 1280x800
- **Proves:** Memorable confirmation with canonical Walrus reference clarity.

## 8) Dashboard Command Center
- **Page:** `/dashboard`
- **Viewport:** 1440x900
- **Proves:** Operational quality, owner scope, submission metrics, form portfolio.

## 9) Form Triage Table
- **Page:** `/dashboard/forms/[id]`
- **Viewport:** 1440x900
- **Proves:** Real triage workflow, filtering, status/priority hierarchy, evidence refs.

## 10) Submission Detail + Seal Section
- **Page:** `/dashboard/forms/[id]` with detail opened
- **Viewport:** 1440x900
- **Proves:** Notes workflow, asset links, Seal decrypt integration surface.

## 11) Export Proof
- **Page:** `/dashboard/forms/[id]` (show export action)
- **Viewport:** 1440x900
- **Proves:** JSON/CSV operational readiness for downstream tooling.

## 12) Mobile Hero
- **Page:** `/`
- **Viewport:** 390x844
- **Proves:** Premium story remains clear on mobile.

## 13) Mobile Public Form
- **Page:** `/f/[slug]`
- **Viewport:** 390x844
- **Proves:** Respondent flow remains usable and trustworthy on small screens.
