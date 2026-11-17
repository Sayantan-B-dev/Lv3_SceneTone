# Files Changed

## 2026-11-17 - Phase 3 auth and persistence

### Backend

- `backend/src/services/users.service.ts` - Google identity upsert, lookup and public user mapping
- `backend/src/services/projects.service.ts` - owner-scoped list/create/read/update/delete helpers
- `backend/src/controllers/auth.controller.ts` - credential verification, session rotation, me/logout
- `backend/src/controllers/projects.controller.ts` - CRUD handlers scoped to the session user
- `backend/src/routes/projects.routes.ts` - wired to the implemented controllers
- `backend/src/middleware/session.ts` - shared cookie name constant and store configuration
- `backend/src/config/env.ts` - added optional `GOOGLE_CALLBACK_URL`
- `backend/test/auth.test.ts` - auth boundary, session lifecycle, validation, CSRF origin
- `backend/test/google.test.ts` - audience-bound verification and failure propagation
- `backend/test/projects.test.ts` - ownership filters for every project operation
- `backend/.env.example` - documented `GOOGLE_CALLBACK_URL`

### Frontend

- `frontend/src/hooks/useAuth.ts` - current user, Google sign-in and sign-out hooks
- `frontend/src/hooks/useProjects.ts` - list/detail/create/update/delete hooks
- `frontend/src/components/auth/SignInButton.tsx` - GIS button with configuration and error states
- `frontend/src/components/auth/AuthControl.tsx` - header session state and sign-out
- `frontend/src/components/layout/Header.tsx` - renders `AuthControl`
- `frontend/src/pages/DashboardPage.tsx` - session-aware project creation and listing
- `frontend/src/pages/ProjectPage.tsx` - project workspace, rename, delete and unavailable states
- `frontend/src/types/index.ts` - added `Project` type
- `frontend/src/styles/layout.css`, `frontend/src/styles/pages.css` - auth and project styles
- `frontend/vite.config.ts` - dev port and API proxy target from env
- `frontend/.env.example` - documented `DEV_SERVER_PORT` and `DEV_API_PROXY_TARGET`

### Docs

- `docs/API_REFERENCE.md` - implemented endpoints, project payloads and error codes
- `docs/TESTING.md`, `docs/CHANGELOG.md`, `README.md` - phase 3 coverage, changelog and env keys
- `SCENETONE_OPENCODE_PROMPTS.md` - phase 3 marked complete
- `docs/agent-state/` - status, TODO, decisions, files, handoff, session log

### Checks

- `npm run typecheck --prefix backend` - passed
- `npm run typecheck --prefix frontend` - passed
- `npm test --prefix backend` - passed (4 files / 16 tests)
- `npm test --prefix frontend` - passed (5 files / 6 tests)

## 2026-11-17 - Phase 2 design system (committed as `61d2178`)

### Reference and theme layer

- `reference/reference.html` - supplied design source, now tracked as untracked content
- `frontend/index.html` - Google Fonts links; pre-paint theme unchanged
- `frontend/src/styles/fonts.css` - display/body/mono font tokens
- `frontend/src/styles/tokens.css` - light vaporwave palette, chrome/window/inset, focus, labels,
  scene tokens, type/space/shape scales
- `frontend/src/styles/themes.css` - dark reference palette and high-contrast focus
- `frontend/src/styles/base.css` - gradient floor, display type, focus rules, reduced motion
- `frontend/src/styles/layout.css` - taskbar shell, grid-column overflow fix, footer
- `frontend/src/styles/components.css` - buttons, windows, fields, tags, notes, marquee, scene,
  metrics, bands, spectrum, drop zone, chips, chain, plugin, FAQ, tables
- `frontend/src/styles/pages.css` - hero, grids, blueprint boxes, plugin and about grids
- `frontend/src/styles/responsive.css` - 53.75rem nav wrap, 40rem mobile, 24rem metric/energy

### Components and routes

- `frontend/src/App.tsx` - Home, Blueprint, Analyze, FL Studio, About routes
- `frontend/src/components/layout/AppShell.tsx` - footer workspace link
- `frontend/src/components/layout/Header.tsx` - reference taskbar navigation
- `frontend/src/components/layout/Clock.tsx` - accessible local clock
- `frontend/src/components/layout/ThemeToggle.tsx` - taskbar select (unchanged behavior)
- `frontend/src/components/ui/Window.tsx` - heading-labelled window chrome
- `frontend/src/components/ui/Tag.tsx` - tag variants
- `frontend/src/components/ui/Marquee.tsx` - decorative marquee
- `frontend/src/components/ui/SceneVisualizer.tsx` - canvas scene, sliders, mood presets
- `frontend/src/components/ui/FaqList.tsx` - accessible accordion
- `frontend/src/components/ui/Button.tsx` - added `cyan` variant
- `frontend/src/pages/LandingPage.tsx` - hero, visualizer, marquee, home windows
- `frontend/src/pages/BlueprintPage.tsx` - sample brief form and labeled local blueprint
- `frontend/src/pages/AnalyzePage.tsx` - inactive analyzer, placeholders, report preview
- `frontend/src/pages/FlStudioPage.tsx` - filters, chain and plugin cards
- `frontend/src/pages/AboutPage.tsx` - FAQ and definitions table
- `frontend/src/pages/DashboardPage.tsx`, `ProjectPage.tsx`, `NotFoundPage.tsx` - restyled
- `frontend/src/components/ui/Window.test.tsx` - window heading test
- `frontend/src/components/ui/FaqList.test.tsx` - accordion state test
- `frontend/src/components/ui/Field.test.tsx` - selector adjusted for required label

### Documentation

- `docs/DESIGN_REFERENCE.md` - reference inventory, mapping, honesty and verification
- `docs/DESIGN_SYSTEM.md` - implemented tokens, primitives, routes and accessibility
- `docs/ROADMAP.md` - design phase complete; backend/auth next
- `docs/TESTING.md` - new tests and manual verification
- `docs/CHANGELOG.md` - phase additions and verification
- `SCENETONE_OPENCODE_PROMPTS.md` - Phase 2 complete, reference available
- `README.md` - UI routes and design reference link
- `docs/agent-state/` - status, TODO, decisions, files, handoff, session log, context index

### Checks

- `npm run typecheck` - passed (backend and frontend)
- `npm run lint` - passed (backend and frontend)
- `npm test` - passed (backend 1, frontend 5 files / 6 tests)
- `npm run build` - passed
- `npm run format:check` - passed
- Headless Chrome screenshots: 1440px light/dark, 390px and 320px
- Headless route check: `/`, `/blueprint`, `/analyze`, `/fl-studio`, `/about` at 1440, 390 and
  320px; `scrollWidth === innerWidth` on all 15 combinations, fonts loaded

### Commit

- Not committed; awaiting explicit approval.

## 2026-11-17 - Phase 1 scaffold

- Committed as `0ca1702` (`chore: scaffold SceneTone frontend and backend`).
