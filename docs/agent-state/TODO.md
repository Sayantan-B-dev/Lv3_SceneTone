# Prioritized TODO

## P0 - Next

- [ ] Obtain `reference.html` - acceptance: file exists at the repository root or its path is
  recorded - blocker for visual parity
- [ ] Commit approved scaffold - acceptance: explicit user approval, then one conventional commit

## P1 - Design system phase

- [ ] Translate the reference design into reusable components - acceptance: no iframe/raw HTML paste,
  centralized styles, responsive layout
- [ ] Complete token and theme coverage - acceptance: light/dark/system switching without reload and
  persisted preference
- [ ] Verify focus, contrast and narrow viewport behavior - acceptance: documented check results

## P1 - Backend and auth phase

- [ ] Implement Google sign-in and local user creation - acceptance: verified `sub`, invalid
  signature/issuer/audience/expiry rejected
- [ ] Implement owner-scoped project CRUD - acceptance: CRUD validation and cross-user denial tests
- [ ] Wire session creation/logout and CSRF behavior - acceptance: cookie flags and logout tests
- [ ] Verify session TTL cleanup on the local database - acceptance: expired session removed

## P1 - Core product phase

- [ ] Implement Adaption adapter with timeout and error mapping - acceptance: 429, 5xx, timeout and
  malformed output tests; no fabricated output
- [ ] Implement browser-local audio analysis - acceptance: silence, mono, stereo and decode failure
  tests; numeric metrics only
- [ ] Implement qualified mix report - acceptance: facts, hypotheses, recommendations and limitations
  separated
- [ ] Implement FL Studio handoff and JSON/Markdown/TXT export - acceptance: manual guidance only;
  secret-free export
- [ ] Disclose scene brief and metric transmission to the AI provider in the UI

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
