# Larust 2-Minute Promo — Storyboard

Companion to `larust-narration.mp3` (1:52). Use this if you record your own screen with Loom and lay the MP3 underneath in CapCut/Descript. Two options below.

## Option A — Use the slideshow MP4 as-is
File: `larust-promo.mp4`. Upload directly to YouTube/Loom/Vimeo, paste link to DeepSurge submission. Done in 5 minutes.

## Option B — Loom screen recording + my MP3 (recommended for the polish bump)
1. Open Loom. Record screen (no mic), 1280x720 window. Approx 2:00 total.
2. Follow the timing below, click as described.
3. Stop, download the Loom MP4.
4. In CapCut: drop your MP4 on the timeline, drop `larust-narration.mp3` on the audio track, align the start.
5. Export 1080p MP4.

## Audio segments → screen action

| Time | Narration line | What you do on screen |
|---|---|---|
| 0:00–0:05 | "Most feedback tools collect text. Larust collects evidence." | Hold on landing page hero (`/`). Cursor still. |
| 0:06–0:23 | "We built Larust for the Walrus Sessions hackathon…" | Slow scroll down landing — pass the 3 KPI cards (Forms 3, Submissions 6, Encrypted) and the "Recent submissions" panel. |
| 0:24–0:41 | "Today, product teams scatter feedback…" | Continue scrolling — "How Larust works" 3-step row visible. |
| 0:42–1:03 | "Larust fixes the intake side first. Anyone can open a public link and submit without ever connecting a wallet…" | Click "Create" in nav → `/create`. Show the 3 template cards (Bug Report selected). Briefly hover Feature Request and Survey cards. |
| 1:04–1:22 | "Behind the scenes, every submission payload and asset is written to Walrus…" | Scroll down on `/create` to expose the field editor + the live preview panel on the right. Hover "Add field" chips toolbar (Short text, Rich text, Dropdown, Checkboxes, Rating, URL, Screenshot, Video). |
| 1:23–1:40 | "Fields the owner marks as sensitive are isolated…" | Click the "Show advanced" toggle on one field, tick the "Sensitive (Seal)" checkbox. Watch the orange Sensitive badge appear in the preview. |
| 1:41–1:59 | "Form owners connect their Sui wallet, sign a session, and unlock a private dashboard…" | Click Dashboard in nav → `/dashboard`. Show the 4 KPIs (Forms / Submissions / Encrypted / Owner) + the form cards (Bug Report Intake, Feature Request Pipeline, Research Survey). |
| 1:59–2:05 | (continued) "…filter, add notes, set urgency, and export as JSON or CSV." | Click "Open triage" on Bug Report Intake. Show the submissions table. Open one submission (Open button) → side drawer with Status/Priority/Rating badges + Walrus blob + response JSON. |
| 2:06–2:12 | "Walletless intake. Walrus-native evidence. Seal-protected secrets. Wallet-gated admin. That's Larust." | Click the JSON or CSV export button (file downloads). Cut back to landing page hero. Fade to black. |

## Notes on what looks great in this build

- The `Connected as 0x324a4352…9f43` line at the top of `/create` is good evidence of the wallet-gated flow without needing to record the signing popup.
- The right-side live preview on `/create` is one of the strongest visual moments — pause 1–2 seconds extra on it.
- On `/dashboard`, the colored template badges (rose for bug-report, blue for feature-request, violet for survey) communicate organization at a glance.
- The Seal-decrypt button in the drawer shows "Seal not configured" — this is correct and honest. Don't try to fake the decrypt.

## Pre-record checklist (5 min)

- [ ] `npm run dev` running on `:3000`
- [ ] Wallet connected, "Admin verified" visible in header
- [ ] Browser at 1280x800 (DevTools device-toolbar OK if you prefer)
- [ ] Zoom level 100%
- [ ] Hide bookmark bar (Cmd+Shift+B)
- [ ] Close all other tabs
- [ ] Hide dock auto-hide or move it off-screen
- [ ] Quit anything that might pop notifications (Slack, Mail)

## After recording — edit pass in CapCut

- Add subtle zoom (105% over 4s) on hero and template cards for cinematic feel.
- Keep no transitions between clips longer than 250ms (snappy is better than fancy).
- Mute the original audio track from Loom completely. Only the MP3 plays.
- Add a 1s fade-to-white at the very end after "That's Larust."
- Export 1080p, ~5 Mbps, MP4. File should be under 25 MB.

## Cleanup before commit

`src/app/api/dev-capture/` was created during automation attempts. Delete it — it's a dev-only route and has no production guard beyond NODE_ENV. Run:
```
rm -rf src/app/api/dev-capture
```
