# Context Index

- Product scope: `docs/SRS.md`
- Stack and dependency policy: `docs/TECH_STACK.md`
- Architecture: `docs/ARCHITECTURE.md`
- API: `docs/API_REFERENCE.md`
- Schema: `docs/DATABASE_SCHEMA.md`
- Security: `docs/SECURITY_AND_PRIVACY.md`
- UI system: `docs/DESIGN_SYSTEM.md`
- Style rules: `docs/STYLE_GUIDE.md`
- Design reference status: `docs/DESIGN_REFERENCE.md`
- Deployment: `docs/DEPLOYMENT.md`
- Tests: `docs/TESTING.md`
- Sequencing: `docs/ROADMAP.md`
- Changelog: `docs/CHANGELOG.md`
- Current handoff: `docs/agent-state/HANDOFF.md`
- Diagrams: `docs/diagrams/*.mmd`

## Code map

- Root orchestration: `package.json`, `scripts/dev.mjs` (no root dependencies)
- Frontend app: `frontend/` (own lockfile, `.env` and `node_modules`)
- Frontend entry: `frontend/src/main.tsx`
- Routes: `frontend/src/App.tsx`
- Shell/layout: `frontend/src/components/layout/`
- UI primitives: `frontend/src/components/ui/`
- Pages: `frontend/src/pages/`
- Styles: `frontend/src/styles/` (entry: `index.css`)
- API client: `frontend/src/lib/api.ts`
- Audio types: `frontend/src/lib/audio/types.ts`
- Backend app: `backend/` (own lockfile, `.env` and `node_modules`)
- Backend entry: `backend/src/server.ts`
- App pipeline: `backend/src/app.ts`
- Routes: `backend/src/routes/`
- Controllers: `backend/src/controllers/`
- Services: `backend/src/services/`
- Models: `backend/src/models/`
- Schemas: `backend/src/schemas/`
- Middleware: `backend/src/middleware/`
- Tests: `backend/test/`, `frontend/src/**/*.test.tsx`

## Commands

- Install both apps: `npm run install:all`
- Dev (both): `npm run dev`
- Dev (separate terminals): `npm run dev:backend`, `npm run dev:frontend`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Test: `npm test`
- Build: `npm run build`
- Format check: `npm run format:check`
- Local MongoDB ping: see `README.md`

## Local connection

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api/v1`
- Health: `http://localhost:5000/api/v1/health`
- MongoDB: `mongodb://127.0.0.1:27017/scenetone`
- Exact origin coupling: `backend/.env` `FRONTEND_ORIGIN` ↔ browser origin
