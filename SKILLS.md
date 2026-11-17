# SKILLS.md — SceneTone Working Guide

## Core workflow
Inspect before editing. Read SRS, TECH_STACK, architecture/security/design docs and agent-state. Preserve working code. Use bounded subagents for independent reviews; primary agent integrates. Make small testable changes. Keep docs factual and update persistent handoff state.

## Frontend
Centralize styles under `frontend/src/styles/`. Import one global style entry. Use semantic CSS tokens, reusable accessible components, responsive layouts and light/dark/system themes. Translate `reference.html` into components; never iframe it.

## Backend
Validate request and provider data. Verify Google ID tokens server-side and use verified `sub`. Use server-side sessions, owner-scoped project access, exact CORS, secure cookie settings, CSRF mitigations, rate limits and redacted logs. Keep secrets backend-only. Isolate Adaption behind a provider adapter.

## Audio
Use Web Audio API for browser-local analysis. Test silence, mono, stereo and decode failure. RMS is not LUFS; sample peak is not true peak. Distinguish objective metrics from subjective listening advice. Never upload raw audio in V1.

## AI
Use structured prompts and schema validation. State assumptions and uncertainty. Handle timeout, 429/quota, malformed output and 5xx. Do not fabricate successful inference.

## Verification
Run focused tests/builds for changed areas and record exact commands/results. If credentials or provider quota are unavailable, say so and test failure paths where possible.
