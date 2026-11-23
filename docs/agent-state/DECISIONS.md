# Decisions

## D-001 - Use an npm workspaces monorepo

- Date: 2026-11-17
- Status: superseded by D-007
- Decision: Keep `frontend/` and `backend/` as npm workspaces under one root package with shared
  tooling.
- Reason: Single lockfile, shared TypeScript/ESLint/Prettier configuration, one install and one CI
  workflow without introducing a build-orchestration framework.
- Consequences: Root scripts fan out to workspaces; package-level manifests stay authoritative for
  runtime dependencies.
- Related files: `package.json`, `frontend/package.json`, `backend/package.json`

## D-002 - Use ESM with NodeNext for the backend

- Date: 2026-11-17
- Status: accepted
- Decision: Backend is `"type": "module"` with `module`/`moduleResolution` set to `NodeNext` and
  explicit `.js` import specifiers.
- Reason: Matches Node.js LTS ESM behavior and avoids a bundler for server code.
- Consequences: Relative backend imports include `.js`; `tsx` runs development and `tsc` emits
  production output.
- Related files: `backend/tsconfig.json`, `backend/src/**/*.ts`

## D-003 - Centralize styling under one global entry

- Date: 2026-11-17
- Status: accepted
- Decision: All CSS lives in `frontend/src/styles/`; `index.css` is the only global import, from
  `main.tsx`.
- Reason: SRS FR-08 requires replaceable design through centralized styles and semantic tokens.
- Consequences: New visual work extends the existing layers rather than adding scattered CSS.
- Related files: `frontend/src/styles/`, `frontend/src/main.tsx`

## D-004 - Keep feature endpoints as honest stubs

- Date: 2026-11-17
- Status: accepted
- Decision: Auth, project and AI routes validate input where possible, then return
  `501 NOT_IMPLEMENTED`.
- Reason: The scaffold must not present mock output as real inference or imply unimplemented
  behavior.
- Consequences: The API shape and security pipeline are testable before feature work; no fake
  blueprint or report is returned.
- Related files: `backend/src/controllers/`, `backend/src/services/adaption.ts`

## D-005 - Preserve supplied source documents verbatim

- Date: 2026-11-17
- Status: accepted
- Decision: Move the supplied SRS and tech-stack Markdown into `docs/`, archive the docx under
  `docs/reference/`, and exclude these supplied documents from Prettier rewriting.
- Reason: Keep the approved requirements source intact while adopting repository documentation
  paths.
- Consequences: App-level formatting checks cover each app; supplied documents stay unmodified.
- Related files: `docs/SRS.md`, `docs/TECH_STACK.md`, `docs/reference/SRS_v1.3_source.docx`

## D-006 - Do not add unused recommended libraries yet

- Date: 2026-11-17
- Status: accepted
- Decision: Install only libraries used by the scaffold; defer React Hook Form, resolvers, charts
  and icons until a feature uses them.
- Reason: AGENTS.md requires adding only dependencies actually used.
- Consequences: Add and pin the remaining approved libraries with the feature that needs them.
- Related files: `frontend/package.json`, `backend/package.json`

## D-007 - Keep frontend and backend independently installable

- Date: 2026-11-17
- Status: accepted
- Decision: Remove npm workspace hoisting. Each app owns its `package.json`, lockfile, `node_modules`
  and `.env`; the root package is dependency-free orchestration only.
- Reason: The apps deploy to separate servers and must not depend on a shared root install.
- Consequences: Run `npm run install:all`; dev and checks forward with `--prefix`. No root
  `node_modules`; each app is separately buildable and deployable.
- Related files: `package.json`, `scripts/dev.mjs`, `frontend/package.json`,
  `backend/package.json`, `.github/workflows/ci.yml`

## D-008 - Use local MongoDB for development

- Date: 2026-11-17
- Status: accepted
- Decision: Development defaults to `mongodb://127.0.0.1:27017/scenetone`; Atlas is deployment-only
  for now.
- Reason: Local development should not depend on cloud credentials.
- Consequences: The API awaits the Mongo connection before listening and exits if it is unavailable.
- Related files: `backend/.env`, `backend/.env.example`, `backend/src/db/connect.ts`

## D-009 - Use a render-prop Field for accessible form controls

- Date: 2026-11-17
- Status: accepted
- Decision: `Field` owns the label, generated id, hint/error ids and invalid/required wiring, and
  exposes them through a render prop consumed by `Input`, `Textarea` or `Select`.
- Reason: Keeps label/description/error association correct in one place while preserving native
  control attributes.
- Consequences: Form features should compose this primitive instead of hand-writing labels and
  `aria-describedby`.
- Related files: `frontend/src/components/ui/Field.tsx`, `Field.test.tsx`

## D-010 - Translate the Win95/vaporwave reference without porting gimmicks

- Date: 2026-11-17
- Status: accepted
- Decision: Keep the reference's taskbar, window chrome, palette, type and composition, but omit
  window dragging, minimize controls and the runaway button; keep the aesthetic with standard
  routed pages and accessible controls.
- Reason: The gimmicks add pointer complexity, keyboard traps and little product value.
- Consequences: Visual parity is intentional at the pattern level, not pixel-for-pixel behavior.
- Related files: `frontend/src/components/layout/Header.tsx`,
  `frontend/src/components/ui/Window.tsx`, `docs/DESIGN_REFERENCE.md`

## D-011 - Label local previews and keep unbuilt actions inactive

- Date: 2026-11-17
- Status: accepted
- Decision: The Blueprint page generates a deterministic local sample and labels it "not AI output";
  Analyze displays inactive states and placeholders; exports are disabled until implemented.
- Reason: The design reference is interactive, but mock generation must never be presented as real
  inference or measurement.
- Consequences: Phase 3 replaces the sample template and activates Analyze only when real flows and
  tests exist.
- Related files: `frontend/src/pages/BlueprintPage.tsx`, `frontend/src/pages/AnalyzePage.tsx`

## D-012 - Application-owned sessions keyed on the verified Google subject

- Date: 2026-11-17
- Status: accepted
- Decision: `/auth/google` verifies the Google ID token, upserts a local user on the verified `sub`,
  regenerates the session id and stores only `userId` in a Mongo-backed session. `/auth/me` destroys
  the session when its user is gone.
- Reason: Keeps identity server-owned, avoids long-lived tokens in the browser and makes stale
  sessions fail closed.
- Consequences: Client-submitted identity fields are ignored; project queries always filter by
  session owner and return `404` for foreign projects.
- Related files: `backend/src/controllers/auth.controller.ts`,
  `backend/src/services/users.service.ts`, `backend/src/services/projects.service.ts`

## D-013 - Every environment-specific URL comes from env, not source

- Date: 2026-11-17
- Status: accepted
- Decision: The Vite dev server port and API proxy target are read from `DEV_SERVER_PORT` and
  `DEV_API_PROXY_TARGET`; browser URLs come from `VITE_API_BASE_URL`; backend origins and OAuth
  callbacks come from `FRONTEND_ORIGIN` and `GOOGLE_CALLBACK_URL`.
- Reason: Deployment hosts, ports and the Google redirect URI differ per environment and must be
  changeable without editing code.
- Consequences: Local defaults exist only as fallbacks in `vite.config.ts`; the production values are
  supplied by env. The callback URL is unused by the current ID-token popup flow and is reserved for
  redirect-mode OAuth.
- Related files: `frontend/vite.config.ts`, `frontend/.env.example`, `backend/.env.example`,
  `backend/src/config/env.ts`

## D-014 - Keep the Worker AI-only

- Date: 2026-11-17
- Status: accepted
- Decision: `backend-worker/` (Hono on Cloudflare Workers) serves health and the AI endpoints only;
  Google sign-in, sessions and MongoDB projects stay on Express and return 501 on the Worker.
- Reason: Workers cannot run the existing Mongoose/Mongo driver and server-side session store, and
  V1 should not duplicate auth. The AI routes only need `fetch` and Zod.
- Consequences: One deployment target for edge AI, unchanged Express backend, documented 501s.

## D-015 - Page guide is DOM-grounded, not RAG

- Date: 2026-11-17
- Status: accepted
- Decision: The floating guide sends a compact text snapshot of visible DOM elements plus recent
  chat to `/api/v1/ai/guide`, and falls back to a local keyword answer when the provider fails.
- Reason: Useful page help without a vector store, embeddings or audio access, while staying honest
  about uncertainty.
- Consequences: Hedged language, no claim of listening, graceful behaviour offline.

## D-016 - Split app and AI API origins

- Date: 2026-11-17
- Status: accepted
- Decision: The frontend reads `VITE_APP_API_URL` for auth, sessions, projects and health, and
  `VITE_AI_API_URL` for the AI routes. Missing AI URL falls back to the app URL; `VITE_API_BASE_URL`
  stays as a legacy app alias.
- Reason: Express and the Worker deploy as separate apps, so one base URL cannot address both.
- Consequences: Sign-in can never be sent to the Worker by accident; AI traffic can move to the edge
  without touching auth. Worker CORS must allow the frontend origin.

## D-017 - Collapse the repository into one Next.js monolith

- Date: 2026-11-21
- Status: accepted
- Decision: Replace the Vite SPA, Express API and Cloudflare Worker with one Next.js 16 App Router
  application at the repository root.
- Reason: One deployable, one package and lockfile, same-origin cookies, no CORS, and a simpler
  Vercel deployment. Mongoose, Google verification, Zod, TanStack Query and browser audio analysis
  port directly.
- Consequences: Sessions are application-owned opaque IDs in MongoDB instead of `express-session`;
  rate limits are Mongo-backed for serverless; AI runs in Next route handlers; Google callback moves
  to the deployed Next origin; existing Express sessions are invalid after the switch.
- Related files: `package.json`, `next.config.ts`, `src/app/`, `src/server/`, `src/proxy.ts`

## D-018 - Analyze audio in a worker with a main-thread fallback

- Date: 2026-11-23
- Status: accepted
- Decision: Decode on the main thread (workers have no `AudioContext`), copy channel data, then run
  the pure DSP core in a module Web Worker with progress and abort. Fall back to the main thread if
  `Worker` is unavailable or the worker fails to start.
- Reason: Long files blocked the UI. The pure core stays unit-testable, and the fallback keeps old
  or restricted browsers working.
- Consequences: Channel data is copied before transfer so a worker failure can retry without
  detached buffers. Raw audio still never leaves the browser.
- Related files: `src/lib/audio/analysis-core.ts`, `src/lib/audio/analysis.worker.ts`,
  `src/lib/audio/analysis-worker-handler.ts`, `src/lib/audio-analysis.ts`

## D-019 - Render saved project outputs with honest export metadata

- Date: 2026-11-23
- Status: accepted
- Decision: The project page renders stored blueprint, metrics and mix report through shared views,
  guarded by runtime shape checks. Exports for saved reports use `model: null` and
  `objective: "Saved mix report"` because the project schema does not persist those fields.
- Reason: Stored outputs were invisible. Showing them plus honest metadata is better than inventing
  attribution.
- Consequences: Adding persisted model/objective needs a schema change; until then exports say what
  is actually known.
- Related files: `src/views/ProjectPage.tsx`, `src/lib/project-data.ts`,
  `src/components/blueprint/BlueprintView.tsx`, `src/components/report/MixReportView.tsx`
