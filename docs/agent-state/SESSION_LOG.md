# Session Log

## 2026-11-17 - Phase 2 reference translation and audit

- Goal: finish Phase 2 using the supplied `reference/reference.html`.
- Result: full vaporwave/Win95 translation with taskbar, windows, hero visualizer, marquee, five
  reference routes and honest placeholder states; light/dark/system themes; responsive layouts.
- Files: new pages, Window/Tag/Marquee/SceneVisualizer/FaqList/Clock components, rewrites of all
  style layers, fonts in `index.html`, docs and state files.
- Checks: typecheck, lint, tests (backend 1; frontend 5 files / 6 tests), build and format check -
  passed. Headless Chrome screenshots at 1440px light/dark, 390px and 320px; no horizontal overflow.
- Audit: independent read-only subagent found focus contrast, micro-label contrast, Japanese
  language, live-region, ARIA, reduced-motion scroll and copy-honesty issues; all were addressed.
- Decisions: keep the Win95 metaphor but omit drag/minimize gimmicks; clearly label the blueprint as
  a local sample; keep Analyze inactive.
- Blockers: none for design; live Google/Adaption verification remains later.
- Next: commit Phase 2 after approval, then Phase 3 auth/session/projects.

## 2026-11-17 - Phase 2 design system subset

- Goal: advance the design system phase without the missing reference design.
- Result: skip link, accessible form primitives, Alert, tokenized focus ring/warning color and
  focused tests added.
- Files: `frontend/src/components/ui/Field.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx`,
  `Alert.tsx`, `AppShell.tsx`, styles, tests and design docs.
- Checks: typecheck, lint, tests, build, format check - passed. One initial test selector issue was
  fixed; final suite passes.
- Decisions: render-prop `Field` keeps label/hint/error wiring in one accessible primitive.
- Blockers: `reference.html` missing; manual a11y and visual parity pending.
- Next: finish Phase 2 when the reference is supplied, then commit after approval.

## 2026-11-17 - Separate servers, local env and connection verification

- Goal: remove workspace hoisting, make frontend/backend independently deployable, add local env
  files, and verify the local connection chain.
- Result: no root `node_modules`; per-app lockfiles and lint/format tooling; local `.env` files
  created; dashboard API status added.
- Checks: separate installs, typecheck, lint, tests, build, format check - passed. Local Mongo ping
  passed. Backend logged `MongoDB connected`; health returned `200` with exact CORS and credentials.
  Frontend served `200` on 5173.
- Decisions: D-001 superseded by D-007 (independent apps); D-008 (local MongoDB for development).
- Blockers: `reference.html` missing; Google/Adaption credentials are placeholders.
- Next: commit after approval, then start Phase 2.

## 2026-11-17 - Phase 1 audit and scaffold

- Goal: verify supplied documents and create a structured repository scaffold.
- Result: frontend, backend, docs and state files created; all scaffold checks passed.
- Files: see `docs/agent-state/FILES_CHANGED.md`.
- Checks: typecheck, lint, test, build, format check - passed.
- Decisions: NodeNext ESM backend, centralized styles, honest `501` stubs, supplied docs preserved,
  only used dependencies installed.
- Commit: `0ca1702`.
- Blockers: `reference.html` missing; no live provider verification.

## 2026-11-17 - Phase 3 auth and persistence

- Implemented Google credential verification wiring, user upsert, session rotation, `/auth/me`,
  logout and owner-scoped project CRUD.
- Added backend auth, Google verification and project service tests; 4 files / 16 tests pass.
- Wired frontend sign-in, header auth control, dashboard project creation/listing and project
  workspace rename/delete.
- Moved the Vite dev port, API proxy target, OAuth callback and API base URL into env files.
- Checks: backend typecheck and tests pass; frontend typecheck and tests pass.

## 2026-11-17 - Phase 4 core product and audio

- Added the Adaption chat-completions adapter with timeout and safe error mapping, prompt builders
  and AI routes with optional owner-scoped persistence.
- Implemented browser-local FFT band energy plus peak, RMS, crest and stereo correlation.
- Blueprint and Analyze pages now use real generation/measurement and export JSON/Markdown.
- Added redirect-mode Google sign-in using `GOOGLE_CALLBACK_URL`.
- Checks: backend 30 tests, frontend 14 tests, both typechecks and builds pass.

## 2026-11-17 - sign-in origin fix and typography

- Diagnosed the empty `VITE_GOOGLE_CLIENT_ID` and the Google `origin_mismatch`; switched the UI to
  the backend redirect flow so only the redirect URI must be registered.
- Replaced the Google-rendered button with a styled button and removed `@react-oauth/google`.
- Replaced pixel fonts with Space Grotesk, Inter and JetBrains Mono and a readable type scale.

## 2026-11-17 - OpenRouter fallback and font switch

- Added OpenRouter as a fallback provider with three keys rotated one at a time; Adaption stays first.
- AI responses now name the provider attempt that succeeded.
- Swapped display/body fonts to MedievalSharp and Macondo and raised the reading size.

## 2026-11-17 - logo integration and mono typography

- Moved the supplied logos into `frontend/public`, fixed the filename typo and derived square marks
  for the header, footer and favicon.
- Unified display/body/code type on Iosevka Charon Mono and retuned the type scale.

## 2026-11-17 - page guide, error clarity and Worker

- Added the wandering, cursor-following guide bot with drag/throw, double-click chat and a local
  DOM fallback; added `POST /api/v1/ai/guide` with a text provider chain.
- Fixed mix-report validation for decoded peaks above 0 dBFS and made validation messages name the
  failing field; UI errors now include those details.
- Added retro hand cursors, fixed the marquee motion, and scaffolded `backend-worker/` (Hono +
  Wrangler) without touching the Express backend.

## 2026-11-17 - separate app and AI API origins

- Split the frontend base URL into `VITE_APP_API_URL` and `VITE_AI_API_URL` so auth and projects stay
  on Express while AI calls can target the Worker. Legacy `VITE_API_BASE_URL` still works for the app.
