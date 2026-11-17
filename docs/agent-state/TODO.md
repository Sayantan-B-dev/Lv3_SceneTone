# Prioritized TODO

## P0 - Next

- [ ] Commit Phase 4 core product - acceptance: one conventional commit
- [ ] Phase 5 integration and deployment readiness - acceptance: production build, end-to-end
  auth/ownership/report/export checks and deployment docs matching configuration

## P1 - Core product and audio

- [x] Implement Adaption adapter with timeout and error mapping
- [x] Implement browser-local audio analysis with numeric metrics only
- [x] Implement qualified mix report with separated facts and hypotheses
- [x] Blueprint/mix-report JSON and Markdown export
- [x] Disclose scene brief and metric transmission to the AI provider in the UI
- [x] Replace the local sample blueprint with the validated provider response
- [x] Activate the Analyze page with real band energy rendering
- [ ] Live provider verification with a real Adaption key - acceptance: one successful blueprint and
  report against the deployed model

## P2 - Later

- [ ] Deployment scaffolding: Nginx, systemd, TLS, Vercel, Atlas verification
- [ ] Playwright end-to-end coverage
- [ ] History and visualization improvements (V1.1)

## Deferred / out of scope

- Full DAW, timeline/MIDI editor, VST hosting, `.flp` generation, stem separation, automatic
  mastering, MCP/DAW bridge, raw-audio cloud storage - excluded from V1 by the SRS

## Completed

- [x] Google sign-in: ID-token verification, user upsert on verified `sub`, session rotation
- [x] `GET /auth/me` with stale-session invalidation and `POST /auth/logout`
- [x] Owner-scoped project list/create/read/update/delete with Zod validation
- [x] Auth, Google verification, project ownership and CSRF tests (backend 16 tests)
- [x] Frontend sign-in control, session-aware dashboard and project workspace
- [x] All environment-specific URLs configurable through env (`VITE_API_BASE_URL`,
  `FRONTEND_ORIGIN`, `GOOGLE_CALLBACK_URL`, `DEV_SERVER_PORT`, `DEV_API_PROXY_TARGET`)
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
