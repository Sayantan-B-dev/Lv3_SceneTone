# Design Reference

## Status: blocked

`reference.html` is not present in the repository.

Per the SRS (FR-08) and the phase plan, the reference must be translated into reusable components
and must not be iframed or pasted raw. Until the reference is supplied:

- The scaffold provides token-driven layout and primitives only.
- Visual parity with the intended design cannot be claimed.
- Do not invent a pixel-accurate reference.

## Required next input

Place the supplied reference file at the repository root as `reference.html` (or provide its path),
then:

1. Inventory sections, components, colors, type and spacing.
2. Map design values to semantic tokens in `frontend/src/styles/tokens.css`.
3. Add theme-aware overrides in `themes.css`.
4. Translate layout and components into React components under `frontend/src/components/`.
5. Verify responsive and accessibility behavior before claiming parity.
