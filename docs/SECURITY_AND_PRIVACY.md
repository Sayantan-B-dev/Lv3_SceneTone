# Security and Privacy

**Status:** scaffold controls exist in code; most feature-level controls are not implemented or
tested yet.

## Implemented in scaffold

| Control                         | Location                                  | Notes                                                                    |
| ------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| Security headers                | `backend/src/middleware/security.ts`      | Helmet defaults                                                          |
| Exact CORS origin               | same                                      | `FRONTEND_ORIGIN`, credentials enabled                                   |
| Origin guard for unsafe methods | same                                      | Rejects mismatched `Origin`; allows non-browser clients without `Origin` |
| Rate limits                     | same                                      | Global, auth and AI limiters; skipped in tests                           |
| Server-side sessions            | `backend/src/middleware/session.ts`       | `express-session` + `connect-mongo`                                      |
| Cookie flags                    | same                                      | `HttpOnly`, `SameSite=Lax`, `Secure` in production                       |
| Body size limit                 | `backend/src/app.ts`                      | 1 MB JSON and URL-encoded                                                |
| Auth guard                      | `backend/src/middleware/auth.ts`          | Requires session `userId`                                                |
| Input validation                | `backend/src/schemas/`                    | Zod at route boundaries                                                  |
| Safe error shape                | `backend/src/middleware/error-handler.ts` | No stack traces or secrets                                               |
| Redacted logs                   | `backend/src/lib/logger.ts`               | Authorization, cookies, credentials, keys                                |
| Secret-only backend config      | `backend/src/config/env.ts`               | Secrets are not public `VITE_*` values                                   |
| Google token verification       | `backend/src/services/google.ts`          | Verifies via `google-auth-library`; not wired to auth route yet          |
| Owner field model               | `backend/src/models/Project.ts`           | `userId` indexed; queries not implemented                                |

## Planned and not yet verified

- Google sign-in flow, verified `sub` identity and local user creation.
- Session creation, rotation, logout and CSRF testing.
- Owner-scoped project CRUD and cross-user denial tests.
- Provider timeouts, 429/quota, malformed output and 5xx handling.
- Deployment TLS, proxy trust, Nginx exposure and certificate renewal.
- Rate-limit tuning in production.
- CSRF strategy validation under the deployed cookie/origin configuration.

## Privacy rules

- Raw audio never leaves the browser in V1.
- Only numeric metrics are sent to the API and AI provider.
- Scene briefs and numeric metrics are sent to the external AI provider; disclose this in the UI
  before those features ship.
- Never claim the model listened to audio when it received metrics only.
- Exports must not contain secrets or provider credentials.
- Never commit `.env`, tokens or user data.

## Environment variables (names only)

`NODE_ENV`, `PORT`, `FRONTEND_ORIGIN`, `MONGODB_URI`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET` (only if applicable), `ADAPTION_API_KEY`, `ADAPTION_BASE_URL`,
`ADAPTION_MODEL`, `AI_REQUEST_TIMEOUT_MS`.

Google client ID is public configuration. All other values above are backend-only.
