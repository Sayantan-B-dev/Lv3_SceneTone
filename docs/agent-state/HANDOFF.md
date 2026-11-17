# Next-Agent Handoff

## Resume point

- Phase/state: Phase 2 design system complete, uncommitted
- Branch/last commit: `main`, `0ca1702` (Phase 1 scaffold)
- Next phase: Phase 3 backend, auth and persistence
- Current task: obtain commit approval for Phase 2, then implement auth/session/projects

## Completed and verified

### Phase 1 (committed)

- Independent frontend/backend apps with separate lockfiles, installs, env files and build outputs.
- Root orchestration is dependency-free; no root `node_modules`.
- Express pipeline, sessions, security middleware, validation, safe errors, redacted logs, models
  and Zod contracts; feature routes remain honest `501` stubs.
- Local MongoDB connection, exact CORS and frontend health link verified.
- Full scaffold checks passed.

### Phase 2 (uncommitted)

- `reference/reference.html` translated into a vaporwave/Win95 React UI.
- Taskbar shell, window chrome, gradient floor, display fonts, tags, notes, buttons and footer.
- Routes: `/`, `/blueprint`, `/analyze`, `/fl-studio`, `/about`, `/dashboard`,
  `/projects/:projectId`, 404.
- Home scene visualizer with sliders and mood presets; reduced-motion static frame.
- Blueprint page produces a deterministic local sample, explicitly labeled not AI output; exports
  disabled and explained.
- Analyze page is visibly inactive; metrics and bands remain placeholders.
- FL Studio catalogue is static guidance with filters and chain; no DAW control claim.
- About FAQ and definitions; accessible accordion and scroll-safe table.
- Light/dark/system tokens, focus contrast, `lang="ja"` and scoped live regions.
- Independent accessibility audit performed and findings addressed.
- Tests: backend 1; frontend 5 files / 6 tests.

## Important constraints for next agent

- The UI is visually complete but AI generation, audio analysis, persistence and exports are not
  implemented. Do not describe the sample blueprint as inference.
- Replace the local template in `frontend/src/pages/BlueprintPage.tsx` only when the Adaption flow
  and validation exist.
- Activate Analyze only with real browser-local Web Audio metrics; never fabricate numbers.
- Keep window chrome decorative; no dragging/minimize behavior was ported.

## Exact next action

1. Open: repository root.
2. Inspect: `docs/SRS.md` auth/project requirements and current backend stubs.
3. Do: implement Google credential verification, app-owned sessions and owner-scoped project CRUD
   with mocked tests; do not require live Google credentials.
4. Verify: `npm run typecheck && npm run lint && npm test && npm run build && npm run format:check`.

## Relevant files

- `frontend/src/pages/BlueprintPage.tsx` - sample template to replace in the AI phase
- `frontend/src/pages/AnalyzePage.tsx` - inactive analyzer to activate in the audio phase
- `frontend/src/pages/FlStudioPage.tsx` - static plugin catalogue
- `frontend/src/components/ui/` - Window, Field controls, Alert, FaqList, visualizer
- `frontend/src/styles/` - all design tokens and layers
- `reference/reference.html` - source design, do not iframe
- `backend/src/middleware/`, `backend/src/routes/`, `backend/src/services/` - Phase 3 targets
- `backend/src/config/env.ts` - blank optional env values are accepted

## Checks

- `npm run typecheck` - passed
- `npm run lint` - passed
- `npm test` - passed (backend 1 test; frontend 5 files / 6 tests)
- `npm run build` - passed
- `npm run format:check` - passed
- Manual visual: 1440px light/dark, 390px and 320px; no horizontal overflow

## Blockers and assumptions

- No blocker for Phase 3 coding. Live Google OAuth and Adaption calls are unverified and need real
  credentials only for manual smoke tests, not automated tests.
- Local MongoDB at `127.0.0.1:27017` was verified earlier.
- Google Fonts are loaded from a third party; fallbacks are in place.

## Required environment variable names

- `NODE_ENV`, `PORT`, `FRONTEND_ORIGIN`, `MONGODB_URI`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `ADAPTION_API_KEY`, `ADAPTION_BASE_URL`, `ADAPTION_MODEL`,
  `AI_REQUEST_TIMEOUT_MS`, `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`

## Git state

- Working tree: Phase 2 changes uncommitted
- Ignored: `backend/.env`, `frontend/.env`, `node_modules/`, build outputs
- Commit status: Phase 1 committed; Phase 2 not committed
- Do not commit without user approval.
