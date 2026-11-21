# SceneTone — TECH_STACK.md

**Status:** Implemented direction. One Next.js monolith.

## Application
- Next.js 16.4.6 App Router, React 19, TypeScript.
- UI routes in `src/app/`; API route handlers in `src/app/api/v1/`.
- Node.js runtime for all routes that touch MongoDB or Google.
- `src/proxy.ts` sets CSP nonces and security headers.

## Frontend
- React, TypeScript, Zod, CSS custom properties.
- TanStack Query for server state.
- Web Audio API for local file decoding and audio metrics.
- No React Router; App Router file routes.
- No `VITE_*` API URLs; same-origin `/api/v1`.

## Backend
- Next.js route handlers (no Express server).
- MongoDB Atlas with Mongoose.
- Google identity: `google-auth-library`, server-side ID token verification.
- Sessions: application-owned opaque session IDs in MongoDB with TTL cleanup and HMAC-signed HttpOnly cookies.
- Security: same-origin Origin checks, CSP, security headers, Mongo-backed rate limits, Zod validation.
- Logging: Pino with secret redaction.
- HTTP: Node built-in `fetch` for Adaption/OpenRouter.

## AI provider
Call Adaption and OpenRouter only from route handlers through one provider adapter. Providers are tried in order (Adaption, then OpenRouter keys 1-3) with per-attempt timeout; malformed structured output, timeout, 429/quota and 5xx move to the next attempt. Never expose provider keys to the browser.

## Testing and operations
- Vitest, Testing Library, jsdom.
- GitHub Actions runs one root job: install, lint, typecheck, test, build.
- Deployment: Vercel single Next.js app, MongoDB Atlas M0, Adaption inference.
- Keep `AI_REQUEST_TIMEOUT_MS` within the deployment function duration; AI routes request `maxDuration = 60`.

## Audio policy
Use Web Audio API first. Add an FFT/DSP package only when a concrete requirement needs it; record package, pinned version, licence, purpose and tests. RMS is not LUFS. Sample peak is not true peak.

## Environment variable names
`NODE_ENV`, `APP_ORIGIN`, `MONGODB_URI`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `ADAPTION_API_KEY`, `ADAPTION_BASE_URL`, `ADAPTION_MODEL`, `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`, `OPENROUTER_API_KEY_1`, `OPENROUTER_API_KEY_2`, `OPENROUTER_API_KEY_3`, `AI_REQUEST_TIMEOUT_MS`.

Never expose secrets through public variables or commit `.env`. Inspect manifests and lockfiles before installing; add only dependencies actually used and pin compatible versions.
