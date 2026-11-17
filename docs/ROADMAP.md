# Roadmap

## Phase 0 — Audit and scaffold (current)

- [x] Verify source docs and organize `docs/`.
- [x] Create monorepo structure, tooling and CI.
- [x] Add frontend shell, centralized styles and theme support.
- [x] Add backend pipeline, models, schemas, services boundary and safe stubs.
- [x] Add agent-state files and handoff.
- [ ] Obtain `reference.html`.

## Phase 1 — Design system completion

- Translate the reference design into components.
- Complete tokens, typography, responsive and accessibility behavior.
- Record visual verification evidence.

## Phase 2 — Backend, auth and persistence

- MongoDB connection verification and indexes.
- Google credential verification and user creation on verified `sub`.
- Server-side session lifecycle and CSRF validation.
- Owner-scoped project CRUD and tests.
- API, schema and security docs updated to implemented status.

## Phase 3 — Core product and audio

- Scene brief to validated blueprint via Adaption adapter.
- Browser-local Web Audio analysis (duration, sample peak dBFS, RMS dBFS, crest factor, approximate
  band energy, stereo correlation when stereo).
- Metrics-only mix report separating facts, hypotheses and recommendations.
- FL Studio stock-plugin handoff.
- JSON and Markdown/TXT export, secret-free.
- Silence, mono, stereo, decode failure and provider failure tests.

## Phase 4 — Integration and deployment readiness

- End-to-end auth, ownership, blueprint/report, export and theme checks.
- Production build, rate limits, logging redaction and error states.
- Nginx, systemd, TLS renewal, Vercel and Atlas configuration verification.
- Deployment documentation matching actual configuration.

## Later

- V1.1: history and visualization improvements.
- V2: lightweight layer/timeline editor, cue markers, browser preview, possible MIDI export.
- V3: optional local DAW bridge/MCP and external audio generation.

Out of V1 scope: full DAW, `.flp` creation, VST hosting, stem separation, automatic mastering,
guaranteed generation, MCP bridge, raw-audio cloud storage.
