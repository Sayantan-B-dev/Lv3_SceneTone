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
