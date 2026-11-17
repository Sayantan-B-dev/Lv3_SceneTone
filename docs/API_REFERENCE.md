# API Reference

**Base path:** `/api/v1`  
**Status:** auth, sessions, owner-scoped project CRUD and AI generation are implemented. Audio
analysis happens in the browser and only numeric metrics are accepted. No mock inference is
returned.

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
| GET    | `/auth/google/start`   | No   | Redirects to Google for redirect-mode OAuth                  |
| GET    | `/auth/google/callback`| No   | Exchanges the code, establishes the session, redirects home  |
| POST   | `/ai/blueprint`        | Yes  | Generates and validates a blueprint; optional persistence    |
| POST   | `/ai/mix-report`       | Yes  | Generates a qualified report from metrics; optional save     |

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

### AI responses

`POST /ai/blueprint` returns `{ blueprint, model, project, persisted }`. `POST /ai/mix-report`
returns `{ report, model, project, persisted }`. `project` is the updated project when an owned
`projectId` was supplied, otherwise `null`. Provider failures never fall back to local samples.

## Error codes

| Code                     | Status | Meaning                                        |
| ------------------------ | ------ | ---------------------------------------------- |
| `VALIDATION_ERROR`       | 400    | Zod validation failed                          |
| `UNAUTHENTICATED`        | 401    | No session user                                |
| `CSRF_ORIGIN_REJECTED`   | 403    | Unsafe request from an unexpected origin       |
| `PROJECT_NOT_FOUND`      | 404    | Unknown project or one owned by another user   |
| `NOT_FOUND`              | 404    | Unknown route                                  |
| `AI_RATE_LIMITED`        | 429    | Provider quota or rate limit                   |
| `INTERNAL_ERROR`         | 500    | Unexpected failure                             |
| `AI_UNAVAILABLE`         | 502    | Provider outage or unreachable endpoint        |
| `AI_INVALID_RESPONSE`    | 502    | Unreadable or empty provider response          |
| `AI_INVALID_OUTPUT`      | 502    | Provider output failed schema validation       |
| `AI_NOT_CONFIGURED`      | 503    | Adaption environment is incomplete             |
| `AI_AUTH_FAILED`         | 503    | Provider rejected the server credentials       |
| `AI_TIMEOUT`             | 504    | Provider exceeded `AI_REQUEST_TIMEOUT_MS`      |
