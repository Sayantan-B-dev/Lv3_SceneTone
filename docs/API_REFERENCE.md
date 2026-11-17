# API Reference

**Base path:** `/api/v1`  
**Status:** auth, sessions and owner-scoped project CRUD are implemented. The AI routes validate
input and return `501 NOT_IMPLEMENTED` until the Adaption adapter and browser-local analysis land.
No mock inference is returned.

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

| Method | Route                  | Auth | Implemented behaviour                                        |
| ------ | ---------------------- | ---- | ------------------------------------------------------------ |
| GET    | `/health`              | No   | `200` service status                                         |
| POST   | `/auth/google`         | No   | Verifies credential, upserts user, rotates session cookie    |
| GET    | `/auth/me`             | No   | `200` with the session user, `401` when absent               |
| POST   | `/auth/logout`         | No   | Destroys session, clears cookie, `204`                       |
| GET    | `/projects`            | Yes  | Lists owned projects, newest update first                    |
| POST   | `/projects`            | Yes  | Creates an owned project, `201`                              |
| GET    | `/projects/:projectId` | Yes  | Reads an owned project, `404` for unknown or foreign owners  |
| PATCH  | `/projects/:projectId` | Yes  | Updates an owned project, `404` for unknown or foreign owner |
| DELETE | `/projects/:projectId` | Yes  | Deletes an owned project, `204`, `404` otherwise             |
| POST   | `/ai/blueprint`        | Yes  | Validates body, returns `501` until the adapter lands        |
| POST   | `/ai/mix-report`       | Yes  | Validates body, returns `501` until the adapter lands        |

## Request notes

### POST `/auth/google`

```json
{ "credential": "<Google ID token>" }
```

The backend verifies signature, issuer, audience and expiry server-side with `google-auth-library`
and keys the user on the verified `sub`. A successful call returns `{ "user": { ... } }`, rotates the
session id and sets `scenetone.sid`. Invalid credentials return `401 INVALID_GOOGLE_TOKEN`.

### POST `/ai/blueprint`

Accepts `sceneDescription` (10-4000 chars), optional `durationSeconds`, `styleDirection`,
`emotionalArc`, `platform`, `constraints` and `projectId`. Provider output must be validated against
`soundscapeBlueprintSchema`; malformed output must fail safely.

### POST `/ai/mix-report`

Accepts an objective, numeric `metrics` and optional project context. Raw audio is never accepted.
Metrics include duration, channels, sample peak dBFS, RMS dBFS, crest factor, approximate band
energy and stereo correlation (nullable for mono).

## Project responses

A project is returned as:

```json
{
  "project": {
    "id": "...",
    "name": "Rain-lit rooftop chase",
    "sceneBrief": "",
    "blueprint": null,
    "audioAnalysis": null,
    "mixReport": null,
    "schemaVersion": 1,
    "createdAt": "2026-11-17T10:00:00.000Z",
    "updatedAt": "2026-11-17T10:00:00.000Z"
  }
}
```

`GET /projects` returns `{ "projects": [...] }`. All queries are scoped to the session user, so a
project owned by another account is reported as `404 PROJECT_NOT_FOUND` rather than `403`.

## Error codes

| Code                   | Status | Meaning                                       |
| ---------------------- | ------ | --------------------------------------------- |
| `VALIDATION_ERROR`     | 400    | Zod validation failed                         |
| `UNAUTHENTICATED`      | 401    | No session user                               |
| `CSRF_ORIGIN_REJECTED` | 403    | Unsafe request from an unexpected origin      |
| `NOT_FOUND`            | 404    | Unknown route                                 |
| `NOT_IMPLEMENTED`      | 501    | Feature not built yet                         |
| `INTERNAL_ERROR`       | 500    | Unexpected failure                            |
| `AI_NOT_CONFIGURED`    | 503    | Adaption environment is incomplete (reserved) |
