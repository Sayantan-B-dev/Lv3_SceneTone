# Testing

## Commands

```bash
npm test                 # backend + frontend Vitest suites
npm run typecheck        # backend + frontend TypeScript
npm run lint             # ESLint
npm run build            # backend tsc + frontend Vite production build
```

Focused (run inside the app directory, or use the app prefix):

```bash
npm test --prefix backend
npm test --prefix frontend
```

Install each app separately with `npm run install:all`; there is no shared root `node_modules`.

## Current tests (scaffold)

| Suite    | File                                         | Covers                                               |
| -------- | -------------------------------------------- | ---------------------------------------------------- |
| Backend  | `backend/test/health.test.ts`                | `GET /api/v1/health` returns `200` and service shape |
| Frontend | `frontend/src/components/ui/Button.test.tsx` | Button renders with an accessible name               |

Tests run with a test environment and do not require live MongoDB, Google or Adaption credentials.

## Required coverage before V1 acceptance

- Auth: invalid signature, issuer, audience and expiry rejected; session flags; logout.
- Projects: CRUD validation, persistence and cross-user denial.
- AI: success, malformed structured output, timeout, 429/quota and 5xx; no fabricated fallback.
- Audio: silence, mono, stereo, decode failure and non-finite metric handling.
- Privacy: raw audio is never uploaded; exports contain no secrets.
- Themes: light/dark/system switching across routes without reload.
- Build and focused checks recorded with exact commands and results.

## Verification rules

- Never claim a check passed without running it.
- Record exact command and result in `docs/agent-state/HANDOFF.md`.
- If live credentials or provider quota are unavailable, test mocked failure paths and mark live
  integration unverified.
- RMS is not LUFS; sample peak is not true peak. Tests and labels must reflect this.
