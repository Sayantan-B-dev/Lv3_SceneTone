# Deployment

**Status:** not configured. This document records the approved target direction only.

## Target topology

| Layer               | Target                         | Notes                                              |
| ------------------- | ------------------------------ | -------------------------------------------------- |
| Frontend            | Vercel Hobby                   | Plan and personal-use constraints apply            |
| API                 | Oracle Cloud Always Free A1 VM | Capacity and idle reclamation can apply            |
| Database            | MongoDB Atlas M0               | Storage and feature limits apply                   |
| AI                  | Adaption API                   | Credit/token priced; not assumed unlimited or free |
| Reverse proxy       | Nginx                          | Only 80/443 public; proxy to Express on localhost  |
| Process supervision | systemd                        | Do not run PM2 as a competing supervisor           |
| TLS                 | Let's Encrypt                  | Automate renewal and monitor expiry                |

A ₹0 target is an objective, not a guarantee.

## Environment variables (names only)

Backend: `NODE_ENV`, `PORT`, `FRONTEND_ORIGIN`, `MONGODB_URI`, `SESSION_SECRET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (only if applicable), `ADAPTION_API_KEY`,
`ADAPTION_BASE_URL`, `ADAPTION_MODEL`, `AI_REQUEST_TIMEOUT_MS`.

Frontend: `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID` (public values only).

## Independent deployables

The frontend and backend each own a `package.json`, lockfile and build output. Deploy only the
relevant directory and run its install/build inside that directory. The root package is for local
orchestration only and has no runtime dependencies.

## Planned steps

1. Provision the Oracle VM and restrict inbound traffic to 80/443.
2. Install Node.js LTS, build the API, and create a systemd unit bound to localhost.
3. Configure Nginx reverse proxy and Let's Encrypt certificates.
4. Set Atlas network access and indexes; verify session TTL cleanup.
5. Deploy the frontend to Vercel with the exact API base URL.
6. Set backend `FRONTEND_ORIGIN` to the exact Vercel origin; verify CORS and cookies.
7. Verify `Secure` cookies, proxy trust, rate limits, logging redaction and health checks.
8. Document actual configuration and limitations before claiming deployment readiness.

## Not yet present

- Nginx, systemd and TLS configuration files.
- CI deployment stages.
- Live smoke tests against a deployed environment.
