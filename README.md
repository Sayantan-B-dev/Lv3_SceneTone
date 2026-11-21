# SceneTone

From a creative scene to a production-ready sound.

SceneTone is a browser-based AI soundscape composition and audio-production co-pilot. It turns a
scene brief into a structured soundscape blueprint and helps a producer interpret objective audio
measurements. It is not a DAW.

## Stack

One Next.js 16 App Router application. UI pages and API route handlers live in the same deployable.
There is no separate frontend or backend server.

```text
src/app/                 pages and /api/v1 route handlers
src/components/          reusable UI
src/hooks/               client data hooks
src/lib/                 API client, audio analysis, exports, page context
src/styles/              centralized token-driven CSS
src/types/               shared client types
src/server/              env, Mongo, models, sessions, schemas, services
src/proxy.ts             CSP nonce and security headers
public/                  logos
docs/                    SRS, architecture, API, security, deployment, agent state
```

## Prerequisites

- Node.js >= 22
- MongoDB running locally on `127.0.0.1:27017` for local development
- Google OAuth credentials when testing sign-in
- Adaption or OpenRouter credentials when testing AI generation

## Local setup

```bash
npm install
cp .env.example .env
```

Set at least `APP_ORIGIN`, `MONGODB_URI`, `SESSION_SECRET` and `GOOGLE_CLIENT_ID` in `.env`.
Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the app:

```bash
npm run dev
```

Open <http://localhost:3000>. API health: <http://localhost:3000/api/v1/health>.

For Google sign-in, add this exact authorized redirect URI in Google Cloud Console:

```text
http://localhost:3000/api/v1/auth/google/callback
```

## Routes

UI: `/`, `/blueprint`, `/analyze`, `/fl-studio`, `/about`, `/dashboard`,
`/projects/[projectId]`.

API: `/api/v1/health`, `/api/v1/auth/*`, `/api/v1/projects`, `/api/v1/projects/:projectId`,
`/api/v1/ai/blueprint`, `/api/v1/ai/mix-report`, `/api/v1/ai/guide`.

## Environment

Server-only values: `NODE_ENV`, `APP_ORIGIN`, `MONGODB_URI`, `SESSION_SECRET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `ADAPTION_API_KEY`,
`ADAPTION_BASE_URL`, `ADAPTION_MODEL`, `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`,
`OPENROUTER_API_KEY_1/2/3`, `AI_REQUEST_TIMEOUT_MS`.

No `VITE_*` or `NEXT_PUBLIC_*` API URLs are needed. The browser always calls `/api/v1` on the same
origin.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

## Deployment

Primary target: one Vercel project plus MongoDB Atlas.

1. Import the repository into Vercel. Framework preset: Next.js. Build: `npm run build`.
2. Set the server environment variables above. `APP_ORIGIN` must be the exact deployed origin.
3. Set `GOOGLE_CALLBACK_URL` to `${APP_ORIGIN}/api/v1/auth/google/callback` and add it to Google
   Cloud Console.
4. Allow the Vercel deployment in MongoDB Atlas network access.
5. AI route handlers request `maxDuration = 60`; keep `AI_REQUEST_TIMEOUT_MS` within the plan limit.

Sessions are stored in MongoDB with a TTL index and an opaque, HMAC-signed HttpOnly cookie. Rate
limits are stored in MongoDB so they survive serverless instances. Audio never leaves the browser;
only numeric metrics are sent to the AI provider.

## Guardrails

- Google identity is verified server-side; sessions are application-owned.
- Project access is scoped to the authenticated owner.
- AI credentials stay server-side.
- RMS is not LUFS; sample peak is not true peak.
- The model never claims to have heard audio.
- No DAW, `.flp` generation, stem separation, automatic mastering or raw-audio cloud storage.
