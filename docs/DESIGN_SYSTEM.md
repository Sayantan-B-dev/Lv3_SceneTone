# Design System

**Status:** implemented. The reference at `reference/reference.html` is translated into React
components and centralized styles. Light, dark and system themes are supported.

## Structure

All styles live under `frontend/src/styles/` and are imported once from `frontend/src/main.tsx` via
`styles/index.css`.

| File             | Purpose                                                                 |
| ---------------- | ----------------------------------------------------------------------- |
| `index.css`      | Single global entry; imports layers in order                            |
| `fonts.css`      | Display, body and mono font tokens with local fallbacks                 |
| `tokens.css`     | Semantic colors, type, spacing, radii, shadows, motion, layout (light)  |
| `themes.css`     | Dark theme overrides via `[data-theme='dark']`                          |
| `reset.css`      | Minimal modern reset                                                    |
| `base.css`       | Element defaults, gradient floor and reduced-motion handling            |
| `layout.css`     | Taskbar shell, main and footer layout                                   |
| `utilities.css`  | `.container`, `.visually-hidden`, `.text-muted`, `.stack`               |
| `components.css` | Buttons, windows, fields, alerts, tags, metrics, bands, FAQ, tables     |
| `pages.css`      | Hero, page grids and reference page composition                         |
| `responsive.css` | Tablet/narrow viewport and no-overflow adjustments                      |

Display, body and code type use `Iosevka Charon Mono` (weights 300-700 plus italics), loaded from Google Fonts in
`frontend/index.html` with monospace fallbacks. No font files are committed.

## Tokens

Use semantic custom properties, never arbitrary hard-coded values in components.

- Page: `--color-bg`, `--gradient-bg`, `--color-text`, `--color-text-muted`, `--color-link`,
  `--color-hero-text`, `--color-jp`, `--color-jp-shadow`.
- Accents: `--color-accent`, `--color-cyan`, `--color-green`, `--color-yellow`, `--color-purple`,
  each with a readable contrast token where used as a button or tag background.
- Chrome/window: `--color-chrome`, `--color-chrome-active`, `--color-chrome-text`,
  `--color-window`, `--color-window-text`, `--color-title-*`, `--color-bevel-*`.
- Inset/form: `--color-inset`, `--color-inset-text`, `--color-inset-muted`, `--color-input-bg`,
  `--color-input-text`, `--color-note-*`.
- Focus: `--color-focus`, `--color-focus-on-surface`, `--focus-ring-width`,
  `--focus-ring-offset`.
- Scene canvas: `--scene-a` through `--scene-e`, `--scene-ink`.
- Type: `--font-display`, `--font-body`, `--text-xs` through `--text-4xl`, `--leading-*`.
- Space/shape/motion/layout: `--space-*`, `--border-width*`, `--shadow-*`, `--duration-*`,
  `--layout-*`, `--z-*`.

## Themes

- Theme preference is `system`, `light` or `dark`.
- `frontend/src/hooks/useTheme.ts` persists preference in `localStorage` under
  `scenetone.theme`, resolves system preference, and updates `data-theme` without reload.
- `frontend/index.html` applies the resolved theme before paint to avoid a flash.
- Light theme is a pastel vaporwave sky; dark theme is the reference purple/pink gradient. Window
  chrome stays silver in both for the Win95 metaphor.
- `prefers-reduced-motion` disables CSS motion; the scene visualizer draws a static frame and
  FL Studio scrolling switches to `auto`.

## Primitives and routes

- `Button` with `primary`, `secondary`, `cyan` and `ghost` variants.
- `Window` with a gradient title bar and heading-labelled content.
- `Tag` with pink, cyan, green and yellow variants.
- `Field` with label, hint and error association, plus `Input`, `Textarea` and `Select` controls.
- `Alert` with `info`, `success`, `warning` and `danger` variants.
- `ApiStatus`, `Marquee`, `SceneVisualizer`, `FaqList`, `Clock`.
- `AppShell`, `Header` (taskbar) and `ThemeToggle`.
- Routes: `/`, `/blueprint`, `/analyze`, `/fl-studio`, `/about`, `/dashboard`,
  `/projects/:projectId`, plus the 404 route.

## Accessibility baseline

- Semantic landmarks: header, primary navigation, main, footer; skip link first in the tab order.
- Visible `:focus-visible` ring using a high-contrast color; darker ring on app chrome/windows.
- Form labels are always associated with controls; hints and errors use `aria-describedby`; invalid
  controls receive `aria-invalid`.
- Status updates use scoped `role="status"` regions; errors use `role="alert"`.
- FAQ buttons expose `aria-expanded`/`aria-controls`; hidden answers use `hidden`.
- Japanese text is marked `lang="ja"`; the decorative marquee is hidden from assistive technology.
- The scene canvas has a descriptive image label; slider labels expose energy and tension.
- Theme selection has an accessible name; native select affordances are preserved.
- Tables use header scopes and a horizontal scroll wrapper on narrow screens.
- Automated checks cover theme persistence, field association, window headings and FAQ toggling.
  Manual visual review covered 1440px, 390px and 320px in both themes.

## Rules

- Translate reference designs into reusable components; never iframe or paste raw design HTML.
- Keep styles centralized; do not scatter global CSS or use large inline style objects.
- Preserve visible focus, semantic landmarks and accessible names.
- New tokens must be theme-aware in both light and dark.
- Do not present the local sample blueprint or static FL Studio catalogue as AI output.
