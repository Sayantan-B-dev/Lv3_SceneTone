# Next-Agent Handoff

## Resume point

- Phase/state: Phase 5 implemented and verified; Worker deploy pending
- Branch/last commit: `main`, newest commit adds the page guide and Worker scaffold
- Next phase: Cloudflare deployment and live provider verification
- Current task: push the repo, set Worker secrets, deploy `scenetone-api`, update `FRONTEND_ORIGIN`

## Completed and verified

### Phases 1-3 (committed)

- Scaffold, design system, and auth/session/owner-scoped project CRUD.
- Backend tests for auth boundaries, Google verification, project ownership and CSRF.

### Phase 4 (uncommitted)

- Adaption adapter: `/chat/completions`, bearer auth, configurable base URL/model, timeout and safe
  mapping for 429, 401/403, 5xx, network failure, empty and schema-invalid output.
- Blueprint and mix report routes validate provider JSON with Zod and optionally persist to an owned
  project; no local fallback exists.
- Browser-local analysis: duration, sample peak dBFS, RMS dBFS, crest factor, FFT band energy and
  stereo correlation. Only metrics leave the browser.
- Blueprint and Analyze pages use real data and export JSON/Markdown.
- Redirect-mode Google sign-in available through `GOOGLE_CALLBACK_URL`.
- Checks: backend 6 files / 30 tests, frontend 7 files / 14 tests, both typechecks and builds pass.

## Important constraints for next agent

- Live AI generation requires `ADAPTION_API_KEY`, `ADAPTION_BASE_URL`, `ADAPTION_MODEL`; nothing has
  been verified against the live provider yet.
- Do not call AI_NOT_CONFIGURED behaviour a provider test.
- Audio never leaves the browser; exports must stay secret-free.
- Keep all environment-specific URLs in env files, never in source.

## Exact next action

1. Open: `docs/SRS.md` section 13 and `docs/DEPLOYMENT.md`.
2. Inspect: current Nginx/systemd/Vercel/Atlas docs against the implementation.
3. Do: Phase 5 verification, production build, deployment documentation and limitations list.
