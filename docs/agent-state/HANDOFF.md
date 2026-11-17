# Next-Agent Handoff

## Resume point

- Phase/state: Phase 3 auth and persistence complete and verified; Phase 4 next
- Branch/last commit: `main`, `61d2178` (Phase 2 design system); Phase 3 pending commit
- Next phase: Phase 4 core product and audio
- Current task: commit Phase 3, then implement the Adaption adapter, local audio analysis, mix
  report and exports

## Completed and verified

### Phase 1 (committed `0ca1702`)

- Independent frontend/backend apps with separate lockfiles, installs, env files and build outputs.
- Bearer-free Express pipeline with sessions, security middleware, validation, safe errors and
  redacted logs.

### Phase 2 (committed `61d2178`)

- `reference/reference.html` translated into the vaporwave/Win95 UI with centralized token CSS.
- Routes: `/`, `/blueprint`, `/analyze`, `/fl-studio`, `/about`, `/dashboard`,
  `/projects/:projectId`, 404.
- Accessible shell, form primitives, theme persistence and design-system tests.

### Phase 3 (uncommitted)

- `POST /auth/google` verifies the Google ID token, upserts the user on the verified `sub`, rotates
  the session id and returns the public user.
- `GET /auth/me` invalidates stale sessions; `POST /auth/logout` destroys the session and clears the
  cookie.
- Owner-scoped project CRUD with Zod validation; foreign or unknown projects return
  `404 PROJECT_NOT_FOUND`.
- Frontend sign-in control in the header, session-aware dashboard with project creation/listing and
  a project workspace with rename and delete.
- Dev port, API proxy target, API base URL, CORS origin and OAuth callback URL all come from env.
- Tests: backend 4 files / 16 tests; frontend 5 files / 6 tests; both typechecks pass.

## Important constraints for next agent

- `POST /ai/blueprint` and `POST /ai/mix-report` still return `501`. Do not present the local sample
  blueprint as inference.
- Audio analysis must stay in the browser; only numeric metrics may reach the backend.
- The Analyze page is still inactive; activate it only with real Web Audio metrics.
- `GOOGLE_CALLBACK_URL` is reserved for redirect-mode OAuth; the current flow uses ID tokens.
- Never add secrets to `VITE_*` variables or to source.

## Exact next action

1. Open: `backend/src/controllers/ai.controller.ts`, `backend/src/schemas/ai.schema.ts`.
2. Inspect: `docs/SRS.md` FR-03 to FR-07 and `docs/TECH_STACK.md` Adaption notes.
3. Do: implement the Adaption adapter with timeout/429/5xx/malformed-output handling, then wire the
   Blueprint page, browser-local analysis, qualified mix report and JSON/Markdown/TXT export.
4. Check: backend and frontend typecheck/tests, then update docs and state files.
