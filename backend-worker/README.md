# SceneTone Worker backend

A separate Cloudflare Worker (Hono) for the AI endpoints and a health check. The Express backend in
`backend/` is unchanged and still owns Google sign-in, sessions and MongoDB projects.

## Endpoints

| Method | Path                 | Purpose                                     |
| ------ | -------------------- | ------------------------------------------- |
| GET    | `/api/v1/health`     | Liveness and runtime name                   |
| POST   | `/api/v1/ai/blueprint` | Structured soundscape blueprint             |
| POST   | `/api/v1/ai/mix-report` | Metric-based mix report                   |
| POST   | `/api/v1/ai/guide`   | Plain-text page guide chat                  |

`/api/v1/auth/*` and `/api/v1/projects/*` return `501` here on purpose: they stay on Express, which
has MongoDB and server-side sessions.

## Cloudflare dashboard

- Repository: `Sayantan-B-dev/Lv3_SceneTone`
- Project name: `scenetone-api`
- Root directory: `backend-worker`
- Build command: blank
- Deploy command: `npx wrangler deploy`
- Preview command: `npx wrangler dev`
- Preview builds: off
- Cloudflare Access: off

## Secrets

Set these with `npx wrangler secret put <NAME>` (never commit values):

`ADAPTION_API_KEY`, `ADAPTION_BASE_URL`, `ADAPTION_MODEL`,
`OPENROUTER_API_KEY_1`, `OPENROUTER_API_KEY_2`, `OPENROUTER_API_KEY_3`.

`FRONTEND_ORIGIN`, `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL` and `AI_REQUEST_TIMEOUT_MS` live in
`wrangler.jsonc` as plain vars. Set `FRONTEND_ORIGIN` to the deployed frontend origin before deploy.

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars   # then fill secrets
npm run dev                      # http://localhost:8787
npm run typecheck
```

## Frontend note

Set `VITE_AI_API_URL` in `frontend/.env` to this Worker's `/api/v1` root to send only AI calls
(`/ai/blueprint`, `/ai/mix-report`, `/ai/guide`) here, and keep `VITE_APP_API_URL` on the Express
backend for sign-in and projects. Keep `FRONTEND_ORIGIN` in sync with the browser origin.

Do not point `VITE_APP_API_URL` at this Worker: auth and project routes return `501`.
