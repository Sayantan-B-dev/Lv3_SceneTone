# Design System

**Status:** initial token and theme layer implemented. Visual parity with a reference design is not
claimed because `reference.html` is absent.

## Structure

All styles live under `frontend/src/styles/` and are imported once from `frontend/src/main.tsx` via
`styles/index.css`.

| File             | Purpose                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| `index.css`      | Single global entry; imports layers in order                           |
| `fonts.css`      | Font family tokens; system stack, no external font dependency          |
| `tokens.css`     | Semantic colors, type, spacing, radii, shadows, motion, layout (light) |
| `themes.css`     | Dark theme overrides via `[data-theme='dark']`                         |
| `reset.css`      | Minimal modern reset                                                   |
| `base.css`       | Element defaults and reduced-motion handling                           |
| `layout.css`     | App shell, header, main and footer layout                              |
| `utilities.css`  | `.container`, `.visually-hidden`, `.text-muted`, `.stack`              |
| `components.css` | Buttons, cards, nav links, theme toggle, eyebrow                       |
| `pages.css`      | Page-level composition                                                 |
| `responsive.css` | Narrow-viewport adjustments                                            |

## Tokens

Use semantic custom properties, never arbitrary hard-coded values in components.

- Color: `--color-bg`, `--color-surface`, `--color-surface-muted`, `--color-text`,
  `--color-text-muted`, `--color-border`, `--color-accent`, `--color-focus`, `--color-danger`,
  `--color-success`.
- Type: `--font-body`, `--text-xs` through `--text-4xl`, `--leading-*`, `--weight-*`.
- Space: `--space-1` through `--space-16`.
- Shape: `--radius-*`, `--border-width`, `--shadow-*`.
- Motion: `--duration-*`, `--ease-standard`.
- Layout: `--layout-content`, `--layout-header`, `--z-header`.

## Themes

- Theme preference is `system`, `light` or `dark`.
- `frontend/src/hooks/useTheme.ts` persists preference in `localStorage` under
  `scenetone.theme`, resolves system preference, and updates `data-theme` without reload.
- `frontend/index.html` applies the resolved theme before paint to avoid a flash.
- Dark tokens are defined in `themes.css`.
- `prefers-reduced-motion` disables non-essential motion.

## Primitives

- `Button` with `primary`, `secondary` and `ghost` variants.
- `Card` container.
- `AppShell`, `Header` and `ThemeToggle` layout components.

## Rules

- Translate reference designs into reusable components; never iframe or paste raw design HTML.
- Keep styles centralized; do not scatter global CSS or use large inline style objects.
- Preserve visible focus, semantic landmarks and accessible names.
- New tokens must be theme-aware in both light and dark.

## Blockers

- `reference.html` is required to validate visual parity. Recorded in
  `docs/agent-state/HANDOFF.md`.
