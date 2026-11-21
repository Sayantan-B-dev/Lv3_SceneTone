# Deployment

**Target:** one Vercel Next.js project plus MongoDB Atlas.

## Topology

| Layer | Target | Notes |
| --- | --- | --- |
| App | Vercel | One Next.js deployment serves UI and `/api/v1` |
| Database | MongoDB Atlas M0 | Users, projects, sessions and rate limits |
| AI | Adaption / OpenRouter | Server-side keys only |

## Environment variables (names only)

`NODE_ENV`, `APP_ORIGIN`, `MONGODB_URI`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `ADAPTION_API_KEY`, `ADAPTION_BASE_URL`,
`ADAPTION_MODEL`, `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`, `OPENROUTER_API_KEY_1`,
`OPENROUTER_API_KEY_2`, `OPENROUTER_API_KEY_3`, `AI_REQUEST_TIMEOUT_MS`.

`APP_ORIGIN` must be the exact deployed origin. `GOOGLE_CALLBACK_URL` must be
`${APP_ORIGIN}/api/v1/auth/google/callback`.

## Steps

1. Import the repository into Vercel. Framework preset: Next.js. Build: `npm run build`.
2. Add the environment variables above for Production and Preview as needed.
3. Add the exact callback URL to Google Cloud Console authorized redirect URIs.
4. Allow Vercel egress in MongoDB Atlas network access.
5. Verify health at `${APP_ORIGIN}/api/v1/health`, sign-in, project CRUD and one AI failure path.
6. Confirm the session cookie is `Secure` and the app is served over HTTPS.

## Notes

- Sessions use a Mongo TTL index and an opaque HMAC-signed cookie.
- Rate limits are Mongo-backed so they work across serverless instances.
- AI route handlers request `maxDuration = 60`; keep `AI_REQUEST_TIMEOUT_MS` within the plan limit.
- No Nginx, systemd, Cloudflare Worker or separate frontend deployment is required.
- Audio never leaves the browser; only numeric metrics are sent to the AI provider.
