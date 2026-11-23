# SceneTone Working TODO

Execution checklist for the first wave. Keep `docs/agent-state/TODO.md` in sync.

## Phase 0 — Scope

- [x] Create root working checklist
- [x] Amend `docs/SRS.md` and `docs/ROADMAP.md` to allow browser-local single-file utilities as V1.1

## Phase 1 — Correctness and performance (item 10)

- [x] Extract pure DSP core to `src/lib/audio/analysis-core.ts`
- [x] Add `src/lib/audio/analysis.worker.ts` with main-thread fallback
- [x] Analyze page: progress, cancel, store `reportModel`, fix `model: null` export bug
- [x] Remove unused duplicate `src/types/blueprint.ts`
- [x] Tests: core metrics, worker handler, export model
- [x] Run typecheck, lint, test, build (format:check still fails on pre-existing files)
- [x] Commit phase

## Phase 2 — Saved project workspace (item 8)

- [ ] Extract shared `BlueprintView` and `MixReportView` components
- [ ] Type `Project` blueprint/analysis/report outputs
- [ ] ProjectPage saved-outputs section with guards and empty states
- [ ] Re-export JSON/Markdown with honest metadata
- [ ] Tests: saved render, empty state, malformed guard
- [ ] Run typecheck, lint, test, build, format:check
- [ ] Commit phase

## Wrap-up

- [ ] Update `docs/CHANGELOG.md` and `docs/agent-state/*`
- [ ] Final handoff notes
