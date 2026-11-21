# Files Changed

## 2026-11-21 - Next.js monolith migration

- Root: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`,
  `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, `.env.example`,
  `.github/workflows/ci.yml`
- App: `src/app/layout.tsx`, `src/app/page.tsx`, route pages, `src/app/api/v1/**/route.ts`,
  `src/app/providers.tsx`, `src/app/not-found.tsx`
- Server: `src/server/config/env.ts`, `db/connect.ts`, `lib/logger.ts`, `models/{User,Project,Session,RateLimit}.ts`,
  `session/session.ts`, `http/{auth,errors,origin,rate-limit,request}.ts`, `services/*`, `schemas/*`
- Client: `src/views/*`, `src/components/*`, `src/hooks/useTheme.ts`, `src/lib/api.ts`,
  `src/lib/theme-script.ts`, `src/styles/*`
- Security: `src/proxy.ts` for CSP nonce and security headers
- Removed: `frontend/`, `backend/`, `backend-worker/`, `scripts/dev.mjs`
- Docs: `README.md`, `AGENTS.md`, `docs/TECH_STACK.md`, `docs/ARCHITECTURE.md`,
  `docs/DEPLOYMENT.md`, `docs/agent-state/*`

Checks: `npm run typecheck`, `npm run lint`, `npm test` (8 files / 18 tests) and `npm run build`
pass. Local `GET /` and `GET /api/v1/health` return 200.
