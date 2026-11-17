# Prioritized TODO

## P0 - Next

- [ ] Commit Phase 2 design system after explicit approval - acceptance: one conventional commit
- [ ] Start Phase 3 backend/auth - acceptance: plan reported before broad edits

## P1 - Backend, auth and persistence

- [ ] Implement Google sign-in and local user creation - acceptance: verified `sub`, invalid
  signature/issuer/audience/expiry rejected
- [ ] Implement owner-scoped project CRUD - acceptance: CRUD validation and cross-user denial tests
- [ ] Wire session creation/logout and CSRF behavior - acceptance: cookie flags and logout tests
- [ ] Verify session TTL cleanup on the local database - acceptance: expired session removed

## P1 - Core product and audio

- [ ] Implement Adaption adapter with timeout and error mapping - acceptance: 429, 5xx, timeout and
  malformed output tests; no fabricated output
- [ ] Implement browser-local audio analysis - acceptance: silence, mono, stereo and decode failure
  tests; numeric metrics only
- [ ] Implement qualified mix report - acceptance: facts, hypotheses, recommendations and limitations
  separated
- [ ] Implement FL Studio handoff and JSON/Markdown/TXT export - acceptance: manual guidance only;
  secret-free export
- [ ] Disclose scene brief and metric transmission to the AI provider in the UI
- [ ] Replace the labeled local blueprint sample with the validated provider response
- [ ] Activate the Analyze page and real spectrum/band rendering

## P2 - Later

- [ ] Deployment scaffolding: Nginx, systemd, TLS, Vercel, Atlas verification
- [ ] Playwright end-to-end coverage
- [ ] History and visualization improvements (V1.1)

## Deferred / out of scope

- Full DAW, timeline/MIDI editor, VST hosting, `.flp` generation, stem separation, automatic
  mastering, MCP/DAW bridge, raw-audio cloud storage - excluded from V1 by the SRS

## Completed

- [x] Independent frontend/backend installs with separate lockfiles and no root `node_modules`
- [x] Local `.env` files created (gitignored) with local MongoDB default
- [x] Local MongoDB connectivity verified
- [x] Frontend origin/CORS and backend health connection verified
- [x] Reference translated into taskbar, window, tag, form and page components
- [x] Home, Blueprint, Analyze, FL Studio and About routes built
- [x] Accessible skip link and focusable main landmark
- [x] Form primitives with label/hint/error association and `Alert`
- [x] Theme-aware focus, warning, label and scene tokens
- [x] Theme persistence, field, window and FAQ tests
- [x] Independent accessibility audit and follow-up fixes
- [x] Light/dark and mobile visual verification without horizontal overflow
