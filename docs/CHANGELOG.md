# Changelog

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
- No live MongoDB, Google or Adaption integration is verified.
- `reference.html` is missing; visual parity is not claimed.
