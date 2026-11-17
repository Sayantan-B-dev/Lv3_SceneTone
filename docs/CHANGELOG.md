# Changelog

## Unreleased

### Added

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

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run format:check` pass.
- Headless Chrome checks at 1440px in light/dark and at 390px/320px; no horizontal overflow.

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
