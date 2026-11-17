# Architecture

**Status:** scaffold only. No product feature is implemented or verified.

## System context

```text
Browser SPA (React) <-> Express API <-> MongoDB Atlas
                             |
                             +---------> Adaption API (server-side only)

Audio files stay in the browser. Only numeric metrics cross the network.
```

See `docs/diagrams/architecture.mmd` and `docs/diagrams/data-flow.mmd`.

## Runtime separation

The frontend and backend are independently installable and deployable applications. Each owns its
`package.json`, lockfile, `node_modules`, `.env` and build output. The root package contains only
dependency-free orchestration scripts for local development and checks.

They connect over HTTP: the frontend uses `VITE_API_BASE_URL`; the backend accepts only the exact
`FRONTEND_ORIGIN` with credentials enabled. No source code or runtime environment is shared between
the apps.

## Components

| Area | Location | Responsibility |
| ----------- | --------------------------- | ----------------------------------------------------------- |
| Web app     | `frontend/`                 | Routes, shell, design system, local audio analysis, exports |
| API         | `backend/src/app.ts`        | HTTP pipeline, sessions, security, routing                  |
| Config      | `backend/src/config/env.ts` | Validated backend environment                               |
| Models      | `backend/src/models/`       | Mongoose `User` and `Project`                               |
| Routes      | `backend/src/routes/`       | `/api/v1` route wiring                                      |
| Controllers | `backend/src/controllers/`  | Feature handlers (currently stubs)                          |
| Services    | `backend/src/services/`     | Google token verification and Adaption adapter              |
| Schemas     | `backend/src/schemas/`      | Zod request and provider-response contracts                 |
| Styles      | `frontend/src/styles/`      | Single global entry, tokens, themes, layered CSS            |

## Request pipeline

1. `pino-http` request logging with secret redaction.
2. Helmet security headers.
3. Exact-origin CORS with credentials.
4. JSON body limit (1 MB).
5. Server-side session middleware (`express-session` + `connect-mongo`).
6. Same-origin guard for unsafe methods.
7. Rate limiting.
8. Route validation (Zod) and authentication guard.
9. Controller.
10. Safe error shape; unexpected errors are logged and not leaked.

## Data flow (target V1)

1. Browser obtains a Google credential.
2. Backend verifies signature, issuer, audience, expiry and uses verified `sub`.
3. Backend creates an application-owned session.
4. Protected project routes are scoped to the session user.
5. Scene brief goes to the backend; backend calls Adaption with its own key.
6. Structured output is schema-validated before storage/return.
7. Audio stays in the browser; Web Audio API computes metrics.
8. Metrics, not audio, are submitted for a mix report.
9. Exports are generated locally.

## Scaffold boundaries

| Concern                                                | Status                   |
| ------------------------------------------------------ | ------------------------ |
| Frontend shell, routes, theme toggle                   | Implemented (shell only) |
| Design tokens and light/dark/system themes             | Implemented (shell only) |
| API pipeline, sessions, CORS, rate limits, error shape | Implemented (scaffold)   |
| Health endpoint                                        | Implemented              |
| Google sign-in and `/auth/me`                          | Stub (`501`)             |
| Project CRUD                                           | Stub (`501`)             |
| Blueprint and mix-report generation                    | Stub (`501`)             |
| Adaption HTTP calls                                    | Not implemented          |
| Local audio analysis                                   | Not implemented          |
| Exports                                                | Not implemented          |
| Deployment configuration                               | Not implemented          |

## Known gaps and blockers

- `reference.html` is missing. Visual parity with the reference design cannot be claimed.
- No MongoDB instance has been used to verify persistence.
- No Google credential has been verified against Google in this scaffold.
- The Adaption model catalogue has not been queried; no model ID is assumed.
