# SceneTone — Software Requirements Specification
**Version:** 1.3 — Final implementation baseline  
**Date:** 17 November 2026  
**Status:** Approved implementation direction; verify against the existing repository before coding.

## 1. Product definition
SceneTone is an AI soundscape composition and audio-production co-pilot. It turns a creative scene brief into a structured soundscape blueprint and helps a producer interpret objective audio measurements. Tagline: “From a creative scene to a production-ready sound.” It is a browser application, not a full DAW.

## 2. V1 goals
- Google sign-in and application-owned sessions.
- MongoDB-backed user and project storage; project CRUD.
- Scene brief to structured soundscape blueprint through the Adaption API.
- Browser-local WAV/MP3 analysis using the Web Audio API.
- AI mix report based on numeric metrics and the user's objective.
- FL Studio-oriented manual plugin-chain suggestions.
- JSON and Markdown/TXT export.
- Replaceable visual design through centralized styles, semantic tokens and themes.

## 3. V1 non-goals
No full DAW, multitrack recording, MIDI sequencer, VST hosting, native `.flp` generation, automatic mastering, stem separation, guaranteed music generation, MCP/DAW bridge, or raw-audio cloud storage. The model must not claim to have listened to audio when it only receives metrics.

## 4. Functional requirements
### FR-01 Authentication
Use Google Identity Services / OpenID Connect. Backend verifies Google ID token signature, issuer, audience and expiry using `google-auth-library`. Use verified Google `sub` as stable identity. Find/create local MongoDB user and establish an application-owned server-side session. Routes: `POST /api/v1/auth/google`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`. Never trust client-submitted identity fields.

### FR-02 Projects
Authenticated users can create, list, read, update and delete their own projects. Every project query must be scoped to the authenticated user. Validate request bodies and route parameters.

### FR-03 Scene blueprint
Accept scene description plus optional duration, style direction, emotional arc, platform and constraints. Return validated structured data containing BPM/key where appropriate, mood/energy curve, arrangement sections, layers, Foley/ambience ideas, automation, transitions, production notes, assumptions and uncertainty. Handle malformed output, timeout, quota, 429 and provider 5xx. Never silently substitute fake AI output.

### FR-04 Browser-local audio analysis
Decode supported WAV/MP3 files in-browser with Web Audio API. Calculate duration, sample peak dBFS, RMS dBFS, crest factor, approximate band energy and stereo correlation when stereo data exists. Handle silence, mono, decode errors and invalid values. Raw audio does not go to backend in V1. RMS is not LUFS; sample peak is not true peak.

### FR-05 Mix report
Send numeric metrics, user objective and relevant project context to backend. Report must distinguish measured facts from hypotheses and recommendations, disclose limitations and avoid unsupported perceptual claims.

### FR-06 FL Studio handoff
May suggest Fruity Parametric EQ 2, Fruity Compressor, Fruity Limiter, Fruity Reeverb 2, Fruity Delay 3, Maximus and Fruity Soft Clipper. Explain purpose and placement; settings are starting points requiring listening and adjustment. Do not claim to control FL Studio or create `.flp` files.

### FR-07 Export
Export blueprint and report as JSON and Markdown/TXT. Exports must not contain secrets or provider credentials.

### FR-08 Design system
Centralize all styles under `frontend/src/styles/`; import one global stylesheet entry once. Use CSS custom properties for semantic colors, typography, spacing, radii, shadows, borders, focus and motion. Support light, dark and system themes, persist preference, follow `prefers-color-scheme`, and switch without reload. Translate `reference.html` into reusable components; do not iframe or paste it raw. If absent, record a blocker and request it before claiming visual parity.

## 5. Technology stack and dependency inventory
This is the approved direction, not a claim that packages are already installed. Inspect package manifests and lockfiles first; preserve compatible existing choices and document deviations.

### Frontend
| Library/API | Purpose | Status |
|---|---|---|
| React | UI | Required |
| Vite | Build/dev server if repository is Vite SPA | Required if applicable |
| TypeScript | Static typing | Required |
| React Router | SPA routing | Required for SPA |
| `@tanstack/react-query` | Server state/cache | Recommended |
| `react-hook-form` | Form state | Recommended |
| `zod` | Runtime validation | Required |
| `@hookform/resolvers` | RHF/Zod integration | Recommended if RHF used |
| `@react-oauth/google` | Google Identity Services integration | Recommended |
| `lucide-react` | Icons | Optional |
| `recharts` | Charts | Optional |
| CSS custom properties | Tokens and themes | Required |
| Web Audio API | Local audio decode/analysis | Native browser API |

### Backend
| Library/API | Purpose | Status |
|---|---|---|
| Node.js LTS | Runtime | Required |
| Express 5 | HTTP API | Required for Express backend |
| Mongoose | MongoDB modelling | Required if using Mongoose |
| `google-auth-library` | Google token verification | Required |
| `express-session` | Server-side sessions | Recommended |
| `connect-mongo` | Mongo session store | Recommended |
| `cors` | Exact cross-origin policy | Required when cross-origin |
| `helmet` | Security headers | Required |
| `express-rate-limit` | Abuse/rate limiting | Required |
| Zod | Request/provider schema validation | Required |
| Pino + `pino-http` | Structured logging | Recommended |
| `dotenv` | Local env loading | Optional |
| Node built-in `fetch` | Adaption HTTP requests | Native Node API |

### Testing and operations
Vitest (unit/integration tests), Supertest (Express route tests), Playwright (optional E2E), GitHub Actions (CI), Nginx (reverse proxy/TLS), systemd (process supervision), Let's Encrypt (HTTPS), Git (version control). Use systemd, not systemd plus PM2. Add an FFT/DSP package only if a documented need exists; record package, version, licence, purpose and tests.

## 6. Audio measurement definitions
- Sample peak dBFS: maximum absolute sample amplitude relative to digital full scale.
- RMS dBFS: root-mean-square sample level over a documented interval.
- Crest factor: peak minus RMS, with measurement window stated.
- Band energy: approximate energy in documented frequency ranges, not perceptual equal-loudness.
- Stereo correlation: channel relationship estimate when two channels exist; unavailable for mono.
These are not substitutes for integrated LUFS, loudness range, oversampled true peak, phase scope or critical listening.

## 7. Architecture and data flow
Browser UI handles projects, composer, local audio analysis and reports. Express API handles auth, sessions, projects, provider adapter and validation. MongoDB Atlas stores users, projects and sessions. Adaption is called server-side only.
1. Browser obtains Google credential via GIS.
2. Browser posts credential to backend; backend verifies token claims.
3. Backend loads/creates user and issues its own session cookie.
4. Browser calls protected project routes; authorization uses session user ID.
5. Scene brief goes to backend; backend calls Adaption with server-side key.
6. Structured response is validated and returned.
7. Audio stays in browser; Web Audio API computes metrics.
8. Browser submits metrics, not raw audio, for mix report.
9. Backend calls Adaption and returns qualified report.
10. User exports locally.

## 8. API outline
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/v1/auth/google` | Verify credential and create session |
| GET | `/api/v1/auth/me` | Current session user |
| POST | `/api/v1/auth/logout` | Destroy session |
| GET/POST | `/api/v1/projects` | List/create owned projects |
| GET/PATCH/DELETE | `/api/v1/projects/:projectId` | Read/update/delete owned project |
| POST | `/api/v1/ai/blueprint` | Generate scene blueprint |
| POST | `/api/v1/ai/mix-report` | Generate report from numeric metrics |

All endpoints validate input, use consistent safe error shapes and avoid leaking stack traces or provider secrets.

## 9. Data model outline
**User:** `_id`, unique `googleId` (verified `sub`), email/emailNormalized, name, avatarUrl, `preferences.theme` (`system|light|dark`), timestamps.  
**Project:** `_id`, `userId`, name, sceneBrief, blueprint, numeric-only `audioAnalysis`, mixReport, timestamps, schemaVersion.  
**Session:** server-side MongoDB session record with TTL cleanup and secure cookie configuration.

## 10. Security and privacy
Keep `ADAPTION_API_KEY`, `MONGODB_URI`, `SESSION_SECRET` and any applicable Google client secret backend-only. Google client ID is public configuration. Use HTTPS, Secure/HttpOnly/SameSite cookies, exact CORS origins, CSRF mitigation, rate limits, request/file-size limits, owner-scoped project queries and secret-redacted logs. Tell users scene briefs and numeric metrics are sent to the AI provider. Do not store raw audio in V1.

## 11. Deployment and cost assumptions
Target: Vercel Hobby frontend; Oracle Cloud Always Free A1 VM backend; MongoDB Atlas M0; Adaption inference. This is a ₹0 target, not a guarantee. Vercel Hobby has plan/usage and personal-use constraints; Oracle capacity/eligibility and idle reclamation can apply; Atlas M0 has storage/features limits; Adaption inference is credit/token-priced and not assumed unlimited/free. Nginx exposes only 80/443 and proxies to Express bound to localhost. Use systemd. Automate Let's Encrypt renewal and monitor certificate expiry, especially for IP-address certificates.
Environment variable names only: `NODE_ENV`, `PORT`, `FRONTEND_ORIGIN`, `MONGODB_URI`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (only if applicable), `ADAPTION_API_KEY`, `ADAPTION_BASE_URL`, `ADAPTION_MODEL`, `AI_REQUEST_TIMEOUT_MS`. Discover current supported Adaption models; do not invent IDs or pricing.

## 12. Resilience
Handle invalid input, unauthenticated/forbidden access, missing projects, provider timeout, 429/quota, malformed structured output, provider 5xx and database outage. Return actionable safe errors. Never return fabricated output as real inference.

## 13. Acceptance criteria
- Invalid Google issuer/audience/signature/expiry rejected.
- Session flags and logout tested.
- Cross-user project access rejected.
- Project CRUD validates and persists.
- Provider success, malformed output, timeout, 429 and 5xx tested.
- Audio metrics tested with silence, mono, stereo and decode failure.
- RMS/peak terminology correct.
- Raw audio never uploaded in V1.
- Exports valid and secret-free.
- Themes work across routes without reload.
- Focused builds/tests pass before phase completion.
- Deployment docs match actual configuration.

## 14. Root documentation deliverables
`docs/SRS.md`, `ARCHITECTURE.md`, `API_REFERENCE.md`, `DATABASE_SCHEMA.md`, `TECH_STACK.md`, `DESIGN_SYSTEM.md`, `STYLE_GUIDE.md`, `DESIGN_REFERENCE.md`, `DEPLOYMENT.md`, `SECURITY_AND_PRIVACY.md`, `TESTING.md`, `ROADMAP.md`, `CHANGELOG.md`, `diagrams/*.mmd`; root `README.md`, `AGENTS.md`, `SKILLS.md`. Persistent agent files: `docs/agent-state/STATUS.md`, `TODO.md`, `DECISIONS.md`, `FILES_CHANGED.md`, `HANDOFF.md`. Keep docs factual: proposed vs implemented vs tested vs deferred.

## 15. Roadmap
V1: auth, projects, blueprint, local audio metrics, mix report, FL Studio handoff, exports. V1.1: UX/history/visualization improvements. V2: lightweight layer/timeline editor, cue markers, browser preview, possible MIDI export. V3: optional local DAW bridge/MCP and external audio-generation provider.

## 16. Change control
Inspect before changing architecture or dependencies. Preserve existing working structure. Never claim completion without implementation and verification. After each phase, summarize and ask for explicit commit approval. Never commit automatically.
