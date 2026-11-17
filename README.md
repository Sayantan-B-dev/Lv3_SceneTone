# SceneTone

From a creative scene to a production-ready sound.

SceneTone is a browser-based AI soundscape composition and audio-production co-pilot. It turns a
scene brief into a structured soundscape blueprint and helps a producer interpret objective audio
measurements. It is not a DAW.

**Current status:** repository scaffold only. The application shell, API skeleton, models, schemas
and design tokens exist. Feature endpoints deliberately return `501 NOT_IMPLEMENTED`; no mock AI
output is presented as real inference.

## Repository layout

The frontend and backend are **two independent applications** in one repository. They have separate
`package.json`, locks, `node_modules`, `.env` files and deployables. The root `package.json` only
orchestrates scripts and has no dependencies of its own.

```text
frontend/            Vite + React + TypeScript SPA (separate server, default :5173)
  package.json       frontend dependencies and lockfile owner
  .env / .env.example
  src/styles/        centralized token-driven CSS (single global entry)
  src/components/    reusable layout and UI primitives
  src/pages/         route-level scaffold pages
  src/lib/           API client, query client, audio analysis types
backend/             Express 5 + TypeScript API (separate server, default :5000)
  package.json       backend dependencies and lockfile owner
  .env / .env.example
  src/config/        validated environment configuration
  src/models/        Mongoose User and Project models
  src/routes/        /api/v1 route wiring
  src/controllers/   feature stubs
  src/services/      Google verification and Adaption adapter boundary
  src/schemas/       Zod request/response schemas
  src/middleware/    sessions, auth, security, validation, errors
scripts/dev.mjs      dependency-free root dev orchestrator
docs/                SRS, architecture, API, schema, security, design, deployment
docs/agent-state/    durable cross-agent handoff state
docs/diagrams/       Mermaid diagrams
```

## How local development runs

```text
Browser :5173  ->  Vite frontend server
       |                 |
       | fetch with credentials
       v                 v
   Backend API :5000  ->  Local MongoDB 127.0.0.1:27017/scenetone
```

- The frontend calls the backend directly using `VITE_API_BASE_URL`.
- The backend accepts only the exact `FRONTEND_ORIGIN` and enables credentials for the session
  cookie.
- The backend connects to `MONGODB_URI` before it starts listening. If MongoDB is unavailable, the
  API exits instead of pretending to be healthy.
- Audio files stay in the browser. Only numeric metrics will be sent to the API in later phases.
- The dashboard shows an **API connected / API unavailable** indicator by calling
  `GET /api/v1/health`.

## Prerequisites

- Node.js >= 22 (see `.nvmrc`).
- MongoDB running locally on `127.0.0.1:27017`.

Check the local database:

```bash
mongosh --quiet --eval "db.runCommand({ ping: 1 })" mongodb://127.0.0.1:27017/scenetone
```

Google OAuth and Adaption credentials are only needed when those features are implemented.

## Local setup

Install each application separately:

```bash
npm run install:all
```

This runs `npm install` inside `backend/` and `frontend/`, creating separate lockfiles and separate
`node_modules` directories. There is intentionally no root `node_modules`.

Create local environment files if they do not exist:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Current local defaults:

### `backend/.env`

```dotenv
NODE_ENV=development
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
MONGODB_URI=mongodb://127.0.0.1:27017/scenetone
SESSION_SECRET=<at least 32 random characters>
GOOGLE_CLIENT_ID=<Google OAuth client id>
GOOGLE_CLIENT_SECRET=<required for Google redirect sign-in, backend-only>
ADAPTION_API_KEY=<backend-only, optional when OpenRouter is set>
ADAPTION_BASE_URL=<Adaption base URL>
ADAPTION_MODEL=<current model id>
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/auto
OPENROUTER_API_KEY_1=<backend-only>
OPENROUTER_API_KEY_2=<backend-only, fallback>
OPENROUTER_API_KEY_3=<backend-only, fallback>
AI_REQUEST_TIMEOUT_MS=30000
```

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### `frontend/.env`

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api/v1
DEV_SERVER_PORT=5173
DEV_API_PROXY_TARGET=http://localhost:5000
```

The AI provider chain is Adaption first (when configured), then the three OpenRouter keys in order.
A failed attempt (timeout, rate limit, provider error, invalid output) moves to the next provider or
key; keys are never sent together and never exposed to the browser.

Google sign-in runs on the backend: the UI links to `/api/v1/auth/google/start`, Google returns
to `GOOGLE_CALLBACK_URL`, and the backend sets the session. No Google client id is needed in the
frontend env.

In Google Cloud Console, add the exact `GOOGLE_CALLBACK_URL` value
(`http://localhost:5000/api/v1/auth/google/callback` locally) as an **Authorized redirect URI**.
Without it Google returns `Error 400: redirect_uri_mismatch`.

Only public values belong in `VITE_*` variables. Never commit `.env` files or put backend secrets in
the frontend environment. Local `.env` files in this working copy are gitignored placeholders.

## Run locally

Start both servers with one command:

```bash
npm run dev
```

Or run them in separate terminals, which matches the separate-server deployment model:

```bash
npm run dev:backend    # Express API on http://localhost:5000
npm run dev:frontend   # Vite app on http://localhost:5173
```

You can also run each app directly:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Verify:

- API health: <http://localhost:5000/api/v1/health>
- Web app: <http://localhost:5173>
- UI routes: `/`, `/blueprint`, `/analyze`, `/fl-studio`, `/about`, `/dashboard`
- Dashboard indicator: **API connected**
- Backend log: `MongoDB connected` followed by `SceneTone API listening`

### Port and connection rules

- `VITE_API_BASE_URL` must point at the backend API root, including `/api/v1`.
- `FRONTEND_ORIGIN` must exactly match the browser origin (scheme, host and port). Default:
  `http://localhost:5173`.
- Vite runs with `strictPort`, so it fails instead of silently moving to another port. If you change
  the frontend port, update `FRONTEND_ORIGIN` in `backend/.env` and restart the API.
- The API session cookie requires credentials; the frontend `apiRequest` helper sends them.
- In production, cookies are `Secure` and the API trusts one proxy hop. Local HTTP development
  intentionally uses a non-secure cookie.

## Cloudflare Worker deployment

The Worker is a separate app and does not change the Express backend.

| Cloudflare field | Value |
| --- | --- |
| GitHub repository | `Sayantan-B-dev/Lv3_SceneTone` |
| Project name | `scenetone-api` |
| Root directory | `backend-worker` |
| Build command | leave blank |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler dev` |
| Enable Preview builds | off |
| Protect with Cloudflare Access | off |

Set `ADAPTION_API_KEY`, `ADAPTION_BASE_URL`, `ADAPTION_MODEL` and
`OPENROUTER_API_KEY_1/2/3` with `npx wrangler secret put <NAME>` from `backend-worker/`.
Set `FRONTEND_ORIGIN` in `backend-worker/wrangler.jsonc` to the deployed frontend origin.
Sign-in and MongoDB projects stay on Express; the Worker returns `501` for `/auth` and `/projects`.
See `backend-worker/README.md` for the endpoint list and local `.dev.vars` flow.

## Checks

Run from the repository root (scripts forward to each app):

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

Unit tests use a test environment and do not require live MongoDB, Google or Adaption credentials.

## Documentation

- [SRS](docs/SRS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API reference](docs/API_REFERENCE.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Design reference](docs/DESIGN_REFERENCE.md) (`reference/reference.html`)
- [Security and privacy](docs/SECURITY_AND_PRIVACY.md)
- [Testing](docs/TESTING.md)
- [Roadmap](docs/ROADMAP.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Agent handoff](docs/agent-state/HANDOFF.md)

## V1 scope guardrails

- Google identity is verified server-side; sessions are application-owned.
- MongoDB stores users, projects and sessions.
- Adaption is called from the backend only.
- Audio analysis is browser-local; only numeric metrics are sent to the API.
- RMS is not LUFS; sample peak is not true peak.
- The model must never claim to have listened to audio.
- Exports are local and contain no secrets.
- No DAW, `.flp` generation, stem separation, automatic mastering or raw-audio cloud storage.

## Commit policy

Do not commit automatically. Each phase ends with a summary and an explicit approval request.
