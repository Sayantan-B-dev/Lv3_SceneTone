# Architecture

**Status:** implemented as a single Next.js application.

## System context

```text
Browser (React client components)
   |
   | same-origin /api/v1
   v
Next.js route handlers (Node.js runtime)
   |
   +---- MongoDB Atlas (users, projects, sessions, rate limits)
   |
   +---- Adaption / OpenRouter (server-side only)

Audio files stay in the browser. Only numeric metrics cross the network.
```

## Runtime

One deployable, one `package.json`, one lockfile. UI pages and API route handlers share the same
origin, so CORS is not needed. Mutations still require an Origin check, and session cookies are
HttpOnly and SameSite=Lax.

## Components

| Area | Location | Responsibility |
| --- | --- | --- |
| Pages | `src/app/` | App Router pages and layouts |
| API | `src/app/api/v1/` | Health, auth, projects and AI route handlers |
| Proxy | `src/proxy.ts` | CSP nonce and security headers |
| UI | `src/components/`, `src/views/` | Reusable components and route views |
| Client data | `src/hooks/`, `src/lib/` | Query hooks, API client, audio analysis, exports |
| Config | `src/server/config/env.ts` | Lazy server-only environment validation |
| Database | `src/server/db/`, `src/server/models/` | Cached Mongoose connection and models |
| Sessions | `src/server/session/` | Opaque Mongo sessions and signed cookies |
| Services | `src/server/services/` | Google verification, provider adapter, projects |
| HTTP | `src/server/http/` | Errors, validation, auth, origin checks, rate limits |
| Styles | `src/styles/` | One global entry, tokens and themes |

## Request pipeline

1. `src/proxy.ts` sets CSP nonce and security headers.
2. Route handler checks Origin for unsafe methods.
3. Mongo-backed rate limit.
4. Zod request validation.
5. Session lookup and owner-scoped service call.
6. Safe error shape; unexpected errors are logged and not leaked.

## Data flow

1. Browser starts Google redirect sign-in.
2. Server verifies the Google code/ID token and uses verified `sub`.
3. Server creates an opaque Mongo session and sets an HttpOnly cookie.
4. Project routes filter by session user.
5. Scene brief goes to the AI provider with server-side credentials.
6. Structured output is schema-validated before storage/return.
7. Audio stays in the browser; only numeric metrics are sent.
8. Exports are generated locally.
