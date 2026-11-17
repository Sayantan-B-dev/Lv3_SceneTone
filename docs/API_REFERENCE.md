# API Reference

**Base path:** `/api/v1`  
**Status:** scaffold. Only `GET /health` is implemented. All other routes validate input where
applicable, then return `501 NOT_IMPLEMENTED`. No mock inference is returned.

## Conventions

- JSON request and response bodies.
- Session cookie: `scenetone.sid` (`HttpOnly`, `SameSite=Lax`, `Secure` in production).
- Auth is application-owned; client identity fields are never trusted.
- Errors use one shape:
  ```json
  { "error": { "code": "CODE", "message": "Safe message", "details": {} } }
  ```
- Secrets, stack traces and provider payloads are never returned.

## Endpoints

| Method | Route                  | Auth | Scaffold behaviour                        |
| ------ | ---------------------- | ---- | ----------------------------------------- |
| GET    | `/health`              | No   | `200` service status                      |
| POST   | `/auth/google`         | No   | Validates credential shape, returns `501` |
| GET    | `/auth/me`             | Yes  | Returns `501` after auth guard            |
| POST   | `/auth/logout`         | Yes  | Returns `501` after auth guard            |
| GET    | `/projects`            | Yes  | Returns `501`                             |
| POST   | `/projects`            | Yes  | Validates body, returns `501`             |
| GET    | `/projects/:projectId` | Yes  | Validates id, returns `501`               |
| PATCH  | `/projects/:projectId` | Yes  | Validates both, returns `501`             |
| DELETE | `/projects/:projectId` | Yes  | Validates id, returns `501`               |
| POST   | `/ai/blueprint`        | Yes  | Validates body, returns `501`             |
| POST   | `/ai/mix-report`       | Yes  | Validates body, returns `501`             |

## Request notes

### POST `/auth/google`

```json
{ "credential": "<Google ID token>" }
```

The final implementation must verify signature, issuer, audience and expiry server-side and key the
user on the verified `sub`.

### POST `/ai/blueprint`

Accepts `sceneDescription` (10-4000 chars), optional `durationSeconds`, `styleDirection`,
`emotionalArc`, `platform`, `constraints` and `projectId`. Provider output must be validated against
`soundscapeBlueprintSchema`; malformed output must fail safely.

### POST `/ai/mix-report`

Accepts an objective, numeric `metrics` and optional project context. Raw audio is never accepted.
Metrics include duration, channels, sample peak dBFS, RMS dBFS, crest factor, approximate band
energy and stereo correlation (nullable for mono).

## Error codes in scaffold

| Code                   | Status | Meaning                                       |
| ---------------------- | ------ | --------------------------------------------- |
| `VALIDATION_ERROR`     | 400    | Zod validation failed                         |
| `UNAUTHENTICATED`      | 401    | No session user                               |
| `CSRF_ORIGIN_REJECTED` | 403    | Unsafe request from an unexpected origin      |
| `NOT_FOUND`            | 404    | Unknown route                                 |
| `NOT_IMPLEMENTED`      | 501    | Feature not built yet                         |
| `INTERNAL_ERROR`       | 500    | Unexpected failure                            |
| `AI_NOT_CONFIGURED`    | 503    | Adaption environment is incomplete (reserved) |
