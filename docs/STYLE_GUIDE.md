# Style Guide

## TypeScript

- Strict mode; avoid `any`.
- Validate untrusted data at boundaries with Zod.
- Use `@/` alias imports in the frontend; relative `.js` specifiers in backend ESM.
- Keep modules focused: routes wire, controllers orchestrate, services hold provider logic.
- Do not add comments that restate code. Explain non-obvious constraints only.

## CSS

- All styles under `frontend/src/styles/`; one global entry.
- Use semantic tokens from `tokens.css` and theme overrides from `themes.css`.
- Follow the layer order in `index.css`.
- Avoid hard-coded colors, spacing and radii in component selectors.
- Use `rem`, `clamp()` and layout primitives; test narrow viewports.
- Preserve focus-visible styles and reduced-motion behavior.

## Naming

- React components: `PascalCase.tsx`.
- Hooks: `useThing.ts`.
- Backend files: `kebab-case` for middleware/routes, `PascalCase` for models.
- API paths: kebab-case (`/mix-report`).
- Environment variables: `UPPER_SNAKE_CASE`; server secrets are never `VITE_*`.

## Quality

- Small, reviewable changes.
- Run `npm run typecheck`, `npm test` and the affected build before claiming completion.
- Update `docs/agent-state/` after meaningful work.
- Never commit secrets, `.env` values, tokens or raw audio.
- Never present mocked output as real inference.
