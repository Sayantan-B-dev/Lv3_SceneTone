# Testing

## Commands

From the repository root:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

Each command forwards to `backend` and `frontend`; each app can also be run directly with
`npm run <script> --prefix <app>`.

## Current tests (auth, persistence, design system)

| Suite    | File                                            | Covers                                                  |
| -------- | ----------------------------------------------- | ------------------------------------------------------- |
| Backend  | `backend/test/auth.test.ts`                     | Invalid credential, missing credential, session lifecycle, logout, stale session, validation, CSRF origin |
| Backend  | `backend/test/google.test.ts`                   | Audience-bound verification, missing `sub`, verifier failure propagation |
| Backend  | `backend/test/projects.test.ts`                 | Owner-scoped list/create/read/update/delete filters      |
| -------- | ----------------------------------------------- | ------------------------------------------------------- |
| Backend  | `backend/test/health.test.ts`                   | `GET /api/v1/health` returns `200` and service shape    |
| Frontend | `frontend/src/components/ui/Button.test.tsx`    | Button renders with an accessible name                  |
| Frontend | `frontend/src/components/ui/Field.test.tsx`     | Label, hint and error association; invalid/required     |
| Frontend | `frontend/src/components/ui/Window.test.tsx`    | Window title is a heading with body content             |
| Frontend | `frontend/src/components/ui/FaqList.test.tsx`   | `aria-expanded` state and answer switching              |
| Frontend | `frontend/src/hooks/useTheme.test.ts`           | System default, applied theme and persistence           |

Tests run with a test environment and do not require live MongoDB, Google or Adaption credentials.

## Manual verification performed

- Vite app served `200` on `http://localhost:5173`.
- Headless Chrome screenshots: home light/dark at 1440px, Blueprint, Analyze, FL Studio, About,
  Dashboard and 404 routes.
- Mobile checks at 390px and 320px; `scrollWidth === innerWidth` confirmed no horizontal overflow.
- Both themes exercised through emulated `prefers-color-scheme`; theme toggle persistence is
  automated.
- Reduced-motion behavior reviewed in CSS and JS scroll handling.
- Independent read-only accessibility audit performed; focus contrast, labels, live regions,
  reduced motion, mobile table overflow and misleading copy were corrected.

## Required coverage before V1 acceptance

- Auth: invalid signature, issuer, audience and expiry rejected; session flags; logout.
  (Adjust: route-level coverage exists; issuer/audience/expiry rely on `google-auth-library`
  verification and are not re-tested against live Google keys.)
- Projects: CRUD validation, persistence and cross-user denial.
  (Adjust: service-level cross-user denial and route validation are covered; live MongoDB
  persistence is verified manually.)
- AI: success, malformed structured output, timeout, 429/quota and 5xx; no fabricated fallback.
- Audio: silence, mono, stereo, decode failure and non-finite metric handling.
- Privacy: raw audio is never uploaded; exports contain no secrets.
- Themes: light/dark/system switching across routes without reload.
- Build and focused checks recorded with exact commands and results.
