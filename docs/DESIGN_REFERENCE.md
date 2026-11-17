# Design Reference

## Status: implemented

Source: `reference/reference.html` (387 lines, vaporwave/Win95 desktop concept).

## Reference inventory

- Fixed purple-to-pink gradient page with a perspective neon grid floor and reduced-motion fallback.
- Sticky silver taskbar with a start-style brand, route tabs, clock and theme control.
- Display typography (`MedievalSharp`) and readable body type (`Macondo`), Japanese subheads.
- Perspective "window" chrome: gradient title bars, silver bodies, bevel borders and hard shadows.
- Home: glitch hero title, live scene visualizer, marquee, three welcome windows.
- Blueprint: scene brief form, metadata tags, section energy bars, six output boxes, export actions.
- Analyze: drop zone, spectrum, six metrics, seven band bars, goal-driven mix report.
- FL Studio: category filters, chain of stock plugins, purpose/placement/starting-point cards.
- About: FAQ accordions and a metric-definition table.
- Lime-on-navy inset panels, dashed notes, tag chips, 3D buttons, square corners.

## Translation mapping

| Reference element | Implementation |
| --- | --- |
| Page gradient and grid floor | `frontend/src/styles/base.css` with `--gradient-bg`, `--color-grid-line`, `--color-floor-fade` |
| Taskbar and tabs | `components/layout/Header.tsx`, `Clock.tsx`, `ThemeToggle.tsx` |
| Window chrome | `components/ui/Window.tsx` plus `.window` styles |
| Tag chips and notes | `Tag.tsx`, `.tag`, `.note` |
| Buttons | `Button.tsx` variants `primary`, `secondary`, `cyan`, `ghost` |
| Scene visualizer | `SceneVisualizer.tsx` using CSS scene tokens and reduced-motion handling |
| Hero, marquee, home windows | `pages/LandingPage.tsx`, `Marquee.tsx` |
| Blueprint form and output | `pages/BlueprintPage.tsx` with local sample template |
| Analyze layout | `pages/AnalyzePage.tsx` with inactive analysis states |
| FL Studio catalogue | `pages/FlStudioPage.tsx` with filter and chain |
| FAQ and definitions | `pages/AboutPage.tsx`, `FaqList.tsx` |

Reference gimmicks (window dragging, minimize buttons, runaway leave button) are intentionally not
ported because they add little product value and complicate keyboard and pointer behavior. The
"leave" interaction is represented by an honest status message.

## Honesty constraints

- The blueprint is a deterministic local sample, labeled "not AI output" in the output window.
- Analyze is visibly inactive; metrics show `—` and band bars are empty.
- Exports are disabled and explained.
- FL Studio content is static guidance and does not claim control over the DAW.

## Verification evidence

- Headless Chrome screenshots at 1440px (light and dark), 390px and 320px.
- No horizontal overflow measured at 390px or 320px (`scrollWidth === innerWidth`).
- Light and dark themes verified through emulated `prefers-color-scheme`.
- Automated accessibility fixes from an independent read-only subagent audit were applied; see
  `docs/agent-state/SESSION_LOG.md`.
