# AGENTS.md — SceneTone Engineering Rules

## Mission and source of truth
Build SceneTone as a small deployable soundscape production co-pilot, not a full DAW. Follow `docs/SRS.md` and `docs/TECH_STACK.md`.

## Before every task
Read `AGENTS.md`, `SKILLS.md`, `README.md`, `docs/SRS.md`, `docs/TECH_STACK.md` and all files under `docs/agent-state/`. Inspect repo structure, git status, manifests, lockfiles and current implementation. Read `reference.html` if present. Report a concise plan and blockers before broad edits.

## Architecture and safety
- Preserve existing compatible frameworks and repository conventions.
- Keep docs at root `docs/`, not nested in frontend/backend.
- Centralize CSS under `frontend/src/styles/`; one global stylesheet entry imported once.
- Use semantic CSS tokens and light/dark/system themes.
- Google OAuth establishes identity; MongoDB stores app data. Verify token server-side and key identity on verified `sub`.
- Use application-owned server-side sessions; do not store long-lived tokens in localStorage.
- Adaption key, Mongo URI and session secret remain backend-only.
- Audio stays in browser in V1; send numeric metrics, never raw audio.
- RMS is not LUFS; sample peak is not true peak.
- Never claim AI listened to audio when it only received metrics.
- Never present mock output as real inference.
- Scope every project operation to authenticated owner.
- Use exact CORS origins, secure cookies, CSRF mitigation, rate limits and secret-redacted logs.

## Scope
V1: Google sign-in, MongoDB projects, scene blueprint, local audio analysis, metric-based mix report, FL Studio manual handoff, JSON/Markdown export. No full DAW, VST hosting, `.flp` creation, automatic mastering, stem separation, guaranteed generation, MCP bridge or cloud audio storage in V1.

## Dependencies and checks
Inspect first; follow `docs/TECH_STACK.md`; add only dependencies actually used. Pin compatible versions and update lockfile. Use focused tests/builds; never claim a check passed unless run.

## Subagents and handoff
Use subagents for bounded independent audits/reviews when available. Primary agent owns architecture and integration. Avoid concurrent edits to same files. After meaningful work and before stopping, update `docs/agent-state/STATUS.md`, `TODO.md`, `DECISIONS.md`, `FILES_CHANGED.md`, `HANDOFF.md`. Handoff includes phase, done, exact files, checks/results, blockers, next action, env var names only and commit status. Never record secrets.

## Communication and commits
Use terse factual updates. Do not reveal chain-of-thought. After each phase, summarize and ask **“Commit this phase?”** Never commit automatically. If approved, use a short conventional commit; do not stage unrelated changes. No AI attribution, bot labels, Co-authored-by AI trailers, generated-by-AI notices or watermarks. Do not falsify authorship or timestamps.
