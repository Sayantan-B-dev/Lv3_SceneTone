# Next-Agent Handoff

## Resume point

- Phase/state: Next.js monolith migration complete and verified locally
- Branch: `main` (monolith merge complete, not pushed)
- Next phase: deploy
- Current task: push `main`, create the Vercel project and set production env values

## Completed and verified

- One Next.js 16.4.6 App Router app serves UI and `/api/v1`.
- Vite, Express and the Cloudflare Worker were removed.
- Mongo-backed opaque sessions with signed HttpOnly cookies.
- Same-origin Origin checks and Mongo-backed rate limits.
- Google redirect and ID-token sign-in routes.
- Owner-scoped project CRUD and AI routes.
- Browser-local audio analysis and exports preserved.
- Checks: typecheck, lint, 18 tests and production build pass.

## Important constraints

- `APP_ORIGIN` must exactly match the deployed origin.
- `GOOGLE_CALLBACK_URL` must be `${APP_ORIGIN}/api/v1/auth/google/callback`.
- Audio never leaves the browser; exports must stay secret-free.
- AI route handlers use `maxDuration = 60`; keep `AI_REQUEST_TIMEOUT_MS` within the Vercel limit.
- Do not import Mongoose into `src/proxy.ts`.

## Exact next action

1. Merge `feat/nextjs-monolith` to `main`.
2. Create the Vercel project with the Next.js preset.
3. Set the env names from `README.md` and `.env.example`.
4. Add the callback URL to Google Cloud Console and allow Vercel in Atlas.
5. Smoke-test health, sign-in, project CRUD and one AI failure path.
