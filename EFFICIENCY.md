# SceneTone — Agent Efficiency & Continuity Protocol

**Version:** 1.0  
**Purpose:** Save tokens, preserve durable project context, and let another agent, CLI, model or human developer resume without relying on the previous chat.

## 1. Operating principles

1. The repository is the durable memory; chat history and model memory are temporary.
2. Store decisions, evidence, changed files, test results, blockers and next actions—not private chain-of-thought.
3. Read only what the current task needs. Do not load every document or source file by default.
4. Inspect git state and existing implementation before editing.
5. Use small tasks with explicit acceptance criteria.
6. Label work accurately: `planned`, `in_progress`, `implemented`, `verified`, `blocked`, `deferred`.
7. Keep state files concise; link to canonical docs rather than copying them.
8. Never commit without explicit user approval.

## 2. Source-of-truth order

When information conflicts, inspect and resolve in this order:
1. Current source code, tests and runtime behavior.
2. Package manifests and lockfiles.
3. `docs/agent-state/HANDOFF.md`.
4. `STATUS.md`, `TODO.md`, `DECISIONS.md`.
5. `docs/SRS.md` and `docs/TECH_STACK.md`.
6. Architecture, API, schema, security, design and deployment docs.
7. Old chat transcripts and assumptions.

If code and documentation disagree, report the mismatch and investigate. Do not silently guess.

## 3. New-session / new-agent loading protocol

Always read these first:
- `AGENTS.md`
- `docs/agent-state/HANDOFF.md`
- `docs/agent-state/STATUS.md`
- `docs/agent-state/TODO.md`
- `docs/agent-state/DECISIONS.md`
- `docs/TECH_STACK.md`

Then inspect:
```bash
git status --short
git branch --show-current
```
Check relevant package manifests and lockfiles. Do not dump `node_modules`, build output, coverage or entire lockfiles into context.

Read other docs only as needed:
- Feature scope: `docs/SRS.md`
- Architecture: `docs/ARCHITECTURE.md`
- Routes: `docs/API_REFERENCE.md`
- Data model: `docs/DATABASE_SCHEMA.md`
- Auth/privacy: `docs/SECURITY_AND_PRIVACY.md`
- UI: `docs/DESIGN_SYSTEM.md`, `STYLE_GUIDE.md`, `DESIGN_REFERENCE.md`
- Hosting: `docs/DEPLOYMENT.md`
- Tests: `docs/TESTING.md`
- Sequencing: `docs/ROADMAP.md`

## 4. Token-saving rules

### Prompt design
- Give one objective, exact scope, relevant paths, constraints and acceptance criteria.
- Refer to SRS requirement IDs instead of pasting the whole SRS.
- Do not repeat rules already in `AGENTS.md`.
- Request concise plans, changed-file lists, exact test commands and blockers.
- Avoid long explanations of routine edits.

### Search before reading
Use targeted search and narrow file ranges:
```bash
rg -n "symbolName|routePath" frontend/src backend/src
sed -n '1,220p' path/to/relevant-file
git diff --stat
git diff --name-only
```
Adapt paths to the actual repository. Avoid broad recursive output. Open only matching files and relevant ranges. Do not re-open unchanged files without a reason.

### Implementation discipline
- Make the smallest complete change.
- Reuse existing utilities and components after inspecting them.
- Avoid unrelated refactors, formatting churn and unnecessary dependencies.
- Do not regenerate whole files for a small change.
- Do not rerun successful tests unless code changed or a new risk requires it.
- Run the narrowest useful test first; run broader tests at integration checkpoints.

### Subagents
Use subagents for bounded independent work such as security, accessibility, API or repository review. Give exact scope, paths and expected concise output. Prefer read-only review agents. Never have multiple agents edit the same files concurrently. Primary agent owns architecture and integration.

### Concise progress format
```text
PLAN: add project ownership guard
FILES: backend/src/routes/projects.ts; backend/test/projects.test.ts
CHECK: focused route test — passed
BLOCKED: none
NEXT: verify update/delete ownership
```

## 5. Durable agent-state files

Create these under `docs/agent-state/`:
```text
STATUS.md
TODO.md
DECISIONS.md
FILES_CHANGED.md
HANDOFF.md
SESSION_LOG.md
CONTEXT_INDEX.md
```

| File | Purpose | Rule |
|---|---|---|
| `STATUS.md` | Current phase/state and checkpoint | Very short |
| `TODO.md` | Prioritized unfinished work and acceptance criteria | Actionable |
| `DECISIONS.md` | Durable architecture/product decisions | Only decisions affecting future work |
| `FILES_CHANGED.md` | Changed paths and purpose per checkpoint | Compact |
| `HANDOFF.md` | Exact next-agent instructions | Highest priority |
| `SESSION_LOG.md` | Chronological summaries and checks | One compact entry per session |
| `CONTEXT_INDEX.md` | Map of docs, modules and commands | Index, not duplicate docs |

### STATUS.md template
```markdown
# Current Status
- Phase: Phase N — name
- State: planned | in_progress | implemented | verified | blocked
- Updated: YYYY-MM-DD HH:MM TZ
- Branch:
- Last known commit:
- Current task:
- Blocker:
- Next action:
- Handoff: HANDOFF.md
```

### TODO.md template
```markdown
# Prioritized TODO
## P0 — Next
- [ ] Task — acceptance: observable result — files: paths
## P1 — This phase
- [ ] Task — acceptance: observable result
## P2 — Later
- [ ] Task
## Deferred / out of scope
- Item — reason
```

### DECISIONS.md template
```markdown
## D-001 — Short title
- Date:
- Status: accepted | superseded | rejected
- Decision:
- Reason:
- Consequences:
- Related files:
```

### FILES_CHANGED.md template
```markdown
## YYYY-MM-DD — Phase/checkpoint
- `path` — what changed
- `test/path` — coverage added/updated
- Checks: exact command — passed/failed/not run
- Commit: hash or not committed
```

### HANDOFF.md template
```markdown
# Next-Agent Handoff
## Resume point
- Phase/state:
- Branch/last commit:
- Current task:

## Completed and verified
- Evidence-backed facts only.

## In progress
- Exact partial work; do not assume complete.

## Exact next action
1. Open: `path`
2. Inspect: symbol/function/component
3. Do: one concrete action
4. Verify: exact command

## Relevant files
- `path` — why it matters

## Checks
- Command — pass/fail/not run and short result

## Blockers and assumptions
- Exact blocker; do not guess.

## Required environment variable names
- `VARIABLE_NAME` — purpose only; never value.

## Git state
- Working tree:
- Uncommitted files:
- Commit status:
- Do not commit without user approval.
```

### SESSION_LOG.md template
```markdown
## YYYY-MM-DD — session
- Goal:
- Result:
- Files:
- Checks:
- Decisions:
- Blockers:
- Next:
```

### CONTEXT_INDEX.md template
```markdown
# Context Index
- Product scope: docs/SRS.md
- Stack: docs/TECH_STACK.md
- Architecture: docs/ARCHITECTURE.md
- API: docs/API_REFERENCE.md
- Schema: docs/DATABASE_SCHEMA.md
- Security: docs/SECURITY_AND_PRIVACY.md
- UI: docs/DESIGN_SYSTEM.md
- Deployment: docs/DEPLOYMENT.md
- Tests: docs/TESTING.md
- Current handoff: docs/agent-state/HANDOFF.md

## Code map
- Frontend entry:
- Routes/components/styles:
- Backend entry/routes/services/models:
- Tests:
```

Do not duplicate entire docs or source files in state files. Never store credentials, tokens, raw audio, private user data or chain-of-thought.

## 6. Checkpoint / context-compaction protocol

Checkpoint after a meaningful task, important decision, test result, before switching agents, before context compaction, or before stopping.

1. Run `git status --short` and `git diff --stat`.
2. Record completed work and exact paths.
3. Record commands actually run and results.
4. Update `STATUS.md`, `TODO.md`, `FILES_CHANGED.md`, `HANDOFF.md`.
5. Add durable decisions to `DECISIONS.md`.
6. Add one concise `SESSION_LOG.md` entry.
7. Make the next action executable without the old chat.
8. Preserve uncommitted work; do not commit without approval.

Built-in context compaction is not durable memory. Summarize objective, decisions, files, checks, blockers and next action, and write them to the repository.

## 7. Switching to another CLI, agent or model

Paste this bootstrap prompt into the new tool:

```text
You are taking over the SceneTone repository. Continue existing work; do not restart it.

1. Read AGENTS.md.
2. Read docs/agent-state/HANDOFF.md, STATUS.md, TODO.md and DECISIONS.md.
3. Read docs/TECH_STACK.md.
4. Inspect git status, branch, manifests, lockfiles and relevant source.
5. Verify the handoff against the actual working tree before editing.
6. Continue from the exact next action in HANDOFF.md.
7. Do not overwrite uncommitted work or repeat completed tasks.
8. Run focused checks and record exact commands/results.
9. Update agent-state files after meaningful progress and before stopping.
10. Never commit without explicit user approval.

If the handoff conflicts with code or git state, stop and report the mismatch before destructive changes.
```

Keep the system vendor-neutral: Markdown and git are the durable interface. Do not rely on a provider's hidden memory or chat history.

## 8. Task slicing

Use this task format:
```text
Task:
Goal:
Relevant files:
Constraints:
Acceptance criteria:
Verification command:
Out of scope:
Expected concise report:
```
A good task changes one logical area and can be reviewed independently. Avoid vague tasks like “finish backend” or “improve everything”.

## 9. Verification ladder

Use the smallest useful check, broadening at integration points:
1. Static inspection / targeted typecheck or lint.
2. Unit test for changed logic.
3. Focused route/component test.
4. Build affected package.
5. Broader suite at phase completion.

Record exact command, pass/fail/not-run, failure summary and whether it is known pre-existing. Never infer test success from reading code. If credentials are missing, test mocked paths and mark live integration unverified.

## 10. Git and file safety

- Inspect working tree before editing.
- Never reset, clean, force-push, amend, rebase or discard work unless explicitly requested.
- Do not stage unrelated files.
- Review diff before commit.
- A checkpoint is not a commit.
- Preserve uncommitted work and describe it in HANDOFF.
- Ask for approval after each phase.

## 11. SceneTone constraints every agent must preserve

- V1 is a production co-pilot, not a DAW.
- Google identity is verified server-side; app sessions are separate.
- MongoDB stores users, projects and sessions.
- Adaption is backend-only; use current model catalogue.
- Adaption inference is credit/token priced; never promise unlimited free use.
- Audio analysis is browser-local; send numeric metrics only.
- RMS is not LUFS; sample peak is not true peak.
- Never claim AI listened to audio if it received metrics only.
- Never present mock output as live inference.
- Project access is owner-scoped.
- Styles are centralized and token-driven.
- Hosting free tiers have quotas, eligibility and capacity limits; ₹0 is a target, not a guarantee.

## 12. Definition of done

A task is done only when behavior is implemented or explicitly blocked/deferred; relevant checks were run or marked not run with reason; no user changes were overwritten; applicable docs and state files are updated; next action is clear; and commit status is explicit.

## 13. Compact end-of-session report

```text
SCENETONE CHECKPOINT
Phase/state:
Done:
Files:
Checks:
Decisions:
Blockers:
Next action:
Git/commit:
```

Keep this short enough to paste into another CLI. Detailed durable records stay in the repository.
