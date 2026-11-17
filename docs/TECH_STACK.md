# SceneTone — TECH_STACK.md

**Status:** Approved implementation direction. Not proof that every dependency is installed.

## Frontend
- Required: React, TypeScript, Zod, CSS custom properties.
- Build tool: Vite if the existing repository is a Vite SPA; do not migrate an existing Next.js app just to match this list.
- SPA routing: React Router.
- Recommended: `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `@react-oauth/google`.
- Optional: `lucide-react`, `recharts`.
- Native: Web Audio API for local file decoding and audio metrics.

## Backend
- Runtime: Node.js LTS.
- API: Express 5 (if consistent with existing backend).
- Persistence: MongoDB Atlas with Mongoose.
- Identity: `google-auth-library` for server-side Google ID token verification.
- Sessions: `express-session` + `connect-mongo`.
- Security: `cors`, `helmet`, `express-rate-limit`, Zod validation.
- Logging: Pino + `pino-http`.
- Config: `dotenv` for local development only; deployment environment variables in production.
- HTTP: Node built-in `fetch` for Adaption.

## Testing and operations
- Vitest, Supertest; Playwright optional for E2E.
- GitHub Actions for CI.
- Nginx reverse proxy, systemd process supervision, Let's Encrypt TLS, Git.
- Do not run PM2 and systemd as competing process supervisors.

## Audio policy
Use Web Audio API first. Add an FFT/DSP package only when a concrete requirement needs it; record package, pinned version, licence, purpose and tests. RMS is not LUFS. Sample peak is not true peak.

## AI provider
Call Adaption and OpenRouter only from the backend through one provider adapter. Providers are tried in order (Adaption, then OpenRouter keys 1-3) with per-attempt timeout; malformed structured output, timeout, 429/quota and 5xx move to the next attempt. Discover model IDs from the current catalogues; `openrouter/auto` is the OpenRouter default and can be overridden. Inference is credit/token priced; never promise unlimited or guaranteed free inference.

## Environment variable names
`NODE_ENV`, `PORT`, `FRONTEND_ORIGIN`, `MONGODB_URI`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (only if applicable), `ADAPTION_API_KEY`, `ADAPTION_BASE_URL`, `ADAPTION_MODEL`, `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`, `OPENROUTER_API_KEY_1`, `OPENROUTER_API_KEY_2`, `OPENROUTER_API_KEY_3`, `AI_REQUEST_TIMEOUT_MS`.

Never expose secrets through `VITE_*` variables or commit `.env`. Inspect manifests and lockfiles before installing; add only dependencies actually used and pin compatible versions.
