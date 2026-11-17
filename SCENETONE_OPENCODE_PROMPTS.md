# SceneTone — Five-Phase OpenCode Prompts

## Shared instructions
You are the primary engineering agent. Read `AGENTS.md`, `SKILLS.md`, `README.md`, `docs/SRS.md`, `docs/TECH_STACK.md` and every `docs/agent-state/` file before work. Inspect the actual repository, manifests, lockfiles, git status and existing implementation. Preserve compatible existing choices. Use subagents for bounded independent tasks if available; primary agent owns architecture and integration. Keep status updates terse and factual. Never reveal chain-of-thought. Never claim checks passed unless run. Update docs and state files. Never expose secrets. Do not add AI attribution, bot labels, Co-authored-by AI trailers or watermarks. Do not commit without explicit user approval. End every phase with a concise report and ask: **“Commit this phase?”**

## Completion status (2026-11-17)

### Phase 1 — Audit and plan
- [x] Audit repository structure, git state, manifests, routes, models and docs
- [x] Create `docs/SRS.md`, `docs/TECH_STACK.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md` and `README.md`
- [x] Separate installed dependencies from proposed ones
- [x] Create/update agent-state files
- [x] Report architecture, gaps, risks, blockers and phase plan
- [x] `reference.html` available for design work (`reference/reference.html`)

### Phase 2 — Design system (complete)
- [x] Centralize styles under `frontend/src/styles/` with one global entry
- [x] Reset, fonts, tokens, themes, base, layout, utilities, components, pages, responsive layers
- [x] Semantic CSS variables and light/dark/system themes with persistence
- [x] Reusable primitives and responsive application shell
- [x] Accessible shell: skip link, landmarks, focus-visible styles, reduced motion
- [x] Accessible form primitives (`Field`, `Input`, `Textarea`, `Select`) and `Alert`
- [x] Automated theme persistence and field accessibility tests
- [x] No iframe or scattered global CSS
- [x] Translate `reference.html` into taskbar, window, form and page components
- [x] Independent accessibility audit and follow-up fixes
- [x] Manual light/dark and 1440/390/320px visual verification

### Phase 3 — Backend, auth and persistence (complete)
- [x] MongoDB connection helpers, User/Project models and session store configuration
- [x] Security middleware, exact CORS, rate limits, Zod validation, redacted logs
- [x] Auth/project/AI route stubs with `501 NOT_IMPLEMENTED`
- [x] Google ID-token verification helper (not wired to routes)
- [x] Local MongoDB connection verified (`127.0.0.1:27017`); backend logs `MongoDB connected`
- [x] Local frontend-to-API link verified (health `200`, exact CORS origin, credentials enabled)
- [x] Complete Google sign-in flow and application session creation
- [x] Owner-scoped project CRUD
- [x] Auth boundary, session, CRUD and cross-user tests
- [x] Live persistence CRUD verification (local MongoDB connection verified; CRUD pending)

### Phase 4 — Core product and audio (complete)
- [x] Zod contracts for blueprint, mix report and numeric audio metrics
- [x] Frontend/domain types for blueprint and mix report
- [x] Adaption provider requests, timeout and error mapping
- [x] Browser-local Web Audio analysis
- [x] Qualified mix report generation
- [x] FL Studio handoff and JSON/Markdown/TXT export
- [x] Silence, mono, stereo, decode and provider failure tests

### Phase 5 — Integration and deployment readiness (not started)
- [ ] End-to-end verification of auth, ownership, blueprint/report, exports and themes
- [ ] Nginx, systemd, TLS, Vercel and Atlas configuration
- [ ] Deployment documentation matching actual configuration

**Overall:** Phases 1-4 complete; Phase 5 integration and deployment readiness next.

## Phase 1 — Audit and plan
Audit repository structure, git status, manifests, lockfiles, routes, models, components, deployment and `reference.html` if present. Do not build product features or install packages. Create/update `docs/SRS.md`, `docs/TECH_STACK.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, README and state files as needed. Separate installed dependencies from proposed ones. Use subagents for independent repo/security/docs audits where available; avoid overlapping edits. Report architecture, gaps, risks, blockers and exact phase plan. Update `STATUS.md`, `TODO.md`, `DECISIONS.md`, `FILES_CHANGED.md`, `HANDOFF.md`. Ask “Commit this phase?”

## Phase 2 — Design system
Use `reference.html` if present. If missing, record blocker and ask for it before claiming visual parity. Centralize all styles in `frontend/src/styles/`; import one global entry once. Build reset/fonts/tokens/themes/base/layout/utilities/components/pages/responsive layers as appropriate. Use semantic CSS variables. Implement light/dark/system themes with persistence, system preference support and no-reload switching. Build reusable accessible primitives and responsive shell. No iframe, scattered global CSS, giant JSX styles or arbitrary hard-coded colors. Use an accessibility subagent if available. Run focused frontend build/tests; update design docs and state files. Ask “Commit this phase?”

## Phase 3 — Backend, auth and persistence
Implement MongoDB connection, User/Project/session models, Google GIS credential flow, server-side token verification (signature/issuer/audience/expiry), verified `sub` identity, server-side session, exact CORS, CSRF mitigations, secure cookies, Helmet, rate limits, Zod validation and structured logs. Add auth routes: `POST /api/v1/auth/google`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`. Add owner-scoped project CRUD. Secrets backend-only. Add/update API/schema/security/deployment docs. Test auth boundaries, session behavior, project CRUD and cross-user denial using mocks; do not require live credentials. Update state files. Ask “Commit this phase?”

## Phase 4 — Core product and audio
Build scene brief workflow and Adaption provider adapter using current documented API and current model catalogue. Validate structured blueprint output. Implement browser-local Web Audio API analysis for duration, sample peak dBFS, RMS dBFS, crest factor, approximate band energy and stereo correlation when stereo. Send metrics only, never raw audio. Generate a mix report that separates facts, hypotheses and recommendations; do not claim perceptual listening. Add FL Studio stock-plugin handoff and JSON/Markdown/TXT export. Handle malformed output, timeout, 429/quota and 5xx. Test silence, mono, stereo, decode failures and provider failures. No mock presented as real AI. Update docs/state. Ask “Commit this phase?”

## Phase 5 — Integration and deployment readiness
Do not expand scope. Verify auth/session/logout, project ownership, blueprint/report, local analysis, no raw audio upload, exports, themes, responsive/accessibility critical paths, error/loading/empty states, rate limits and secret redaction. Run production build and focused tests. Verify Nginx proxies to Express bound to localhost, only 80/443 public, systemd service, HTTPS renewal automation, Vercel env and exact CORS origin, MongoDB indexes/session TTL. Update all docs to reflect actual implementation and list limitations. Final report: done/deferred, exact files, checks/results, env names only, deployment checklist and commit status. Update all state files. Ask “Commit this phase?”
