# Changelog

## Unreleased

### Added

- Google sign-in: backend ID-token verification, user upsert on verified `sub`, session id rotation
  and `POST /auth/google`.
- Application sessions: Mongo-backed store, `GET /auth/me` with stale-session invalidation and
  `POST /auth/logout`.
- Owner-scoped project CRUD service, controllers and routes with Zod validation.
- Frontend auth: `useAuth` hooks, `SignInButton`, `AuthControl` in the header and a session-aware
  dashboard.
- Frontend projects: `useProjects` hooks, project creation/listing on the dashboard and a project
  workspace with rename, delete and unavailable states.
- Backend tests for auth boundaries, Google verification, project ownership and CSRF rejection.
- Translation of `reference/reference.html` into a vaporwave/Win95 UI: taskbar, window chrome,
  tags, gradient floor, glitch hero, marquee and inset panels.
- Home, Blueprint, Analyze, FL Studio and About routes, plus routed sample and inactive states.
- `Window`, `Tag`, `Marquee`, `SceneVisualizer`, `FaqList` and `Clock` components.
- `Button` `cyan` variant.
- Accessible skip link and focusable main landmark.
- `Field`, `Input`, `Textarea`, `Select` and `Alert` primitives.
- Warning color, focus and scene palette tokens for light and dark themes.
- Theme persistence, field, window and FAQ tests.
- Independent accessibility audit and follow-up fixes (focus contrast, labels, live regions,
  reduced-motion scrolling, mobile table overflow).

### Changed

- Display/body fonts switched to `Press Start 2P` and `VT323` with monospace fallbacks.
- Google Fonts loaded from `frontend/index.html`.
- Blueprint output is a deterministic local sample, explicitly labeled as not AI output.
- Analyze page documents that decoding is inactive; metrics remain placeholders.
- Landing and About copy now describe analysis as arriving in the audio phase.
- Native select affordances preserved for the theme toggle.
- Phase 1 design completion and reference status documentation updated.

### Verified

- `npm run typecheck --prefix backend` and `--prefix frontend` pass.
- `npm test --prefix backend` passes (4 files / 16 tests).
- `npm test --prefix frontend` passes (5 files / 6 tests).
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run format:check` pass for the
  design-system phase.
- Headless Chrome checks at 1440px in light/dark and at 390px/320px; no horizontal overflow.

## Unreleased - sign-in and typography fixes

### Changed

- Sign-in uses the server redirect flow behind a custom styled button, so no Google-rendered button
  or JavaScript-origin registration is required; only the authorized redirect URI.
- Typography switched from `Press Start 2P`/`VT323` to `Space Grotesk`/`Inter`/`JetBrains Mono`
  with a readable scale and line height.
- Removed the unused `@react-oauth/google` dependency and `VITE_GOOGLE_CLIENT_ID` config.
- Auth redirect outcomes surface on the dashboard (`?auth=failed`, `?auth=unconfigured`).

## 0.1.0 — 2026-11-17

### Added

- Independent frontend and backend application scaffold in one repository.
- Vite + React + TypeScript shell with routes, app layout and theme toggle.
- Centralized token-driven CSS with light/dark/system theme support.
- Express 5 + TypeScript API scaffold with sessions, security middleware, validation, safe error
  handling and a health endpoint.
- Mongoose `User` and `Project` models with owner-scoped index shapes.
- Zod schemas for auth, projects, audio metrics, blueprint and mix report contracts.
- Google token verification helper and Adaption provider boundary (no inference implemented).
- Documentation set, Mermaid diagrams and agent-state handoff files.
- CI workflow, ESLint, Prettier and EditorConfig.

### Notes

- Feature endpoints are stubs and return `501 NOT_IMPLEMENTED`.
- No live Google or Adaption integration is verified.
- The design reference is now available; visual translation is tracked above.

## Unreleased - Phase 4 core product and audio

### Added

- Adaption adapter with bearer auth, configurable base URL/model, request timeout, and safe mapping
  for 429, provider 401/403, 5xx, network failure, empty responses and schema-invalid output.
- Prompt builders for scene blueprints and qualified mix reports that forbid listening claims.
- `POST /ai/blueprint` and `POST /ai/mix-report` wired to the adapter, with optional persistence into
  an owned project (`blueprint`, `mixReport`, numeric `audioAnalysis`).
- Browser-local Web Audio analysis: duration, sample peak dBFS, RMS dBFS, crest factor,
  approximate FFT band energy and stereo correlation.
- Blueprint page now calls the API and exports JSON/Markdown; Analyze page decodes local files,
  shows real metrics, requests a mix report and exports it.
- Redirect-mode Google sign-in routes (`/auth/google/start`, `/auth/google/callback`) using
  `GOOGLE_CALLBACK_URL`.
- Backend adapter and AI route tests; frontend metric and export tests.

### Changed

- Removed the local sample blueprint; the page shows no blueprint until generation succeeds.
- Project workspace links to blueprint generation and audio analysis.
- Removed hard-coded dev host links from source; the Vite port and proxy target come from env.
