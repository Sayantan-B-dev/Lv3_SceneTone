# Prioritized TODO

## P0 - Deploy

- [x] Merge `feat/nextjs-monolith` to `main`
- [x] Push `main` to origin
- [ ] Create Vercel project with the Next.js preset
- [ ] Set `APP_ORIGIN`, `MONGODB_URI`, `SESSION_SECRET`, Google and AI env values
- [ ] Add `${APP_ORIGIN}/api/v1/auth/google/callback` to Google Cloud Console
- [ ] Allow Vercel egress in MongoDB Atlas
- [ ] Smoke-test health, sign-in, project CRUD and one AI failure path
- [ ] Verify live AI generation with real provider credentials

## P1 - Follow-up

- [ ] Add route-handler tests for auth, ownership and AI error mapping
- [ ] Verify CSP in production with the Vercel deployment
- [ ] Confirm Mongo session TTL cleanup and rate-limit TTL in Atlas
- [x] V1.1 tool: browser-local WAV converter/export
- [ ] Next V1.1 tool: approximate LUFS and oversampled true peak
- [ ] Next V1.1 tool: spectrogram/spectrum view
- [ ] Next V1.1 tool: trim/fade/loop export

## Deferred / out of scope

- Full DAW, timeline/MIDI editor, VST hosting, `.flp` generation, stem separation, automatic
  mastering, MCP/DAW bridge, raw-audio cloud storage - excluded from V1 by the SRS

## Completed

- [x] One Next.js App Router app for UI and `/api/v1`
- [x] Mongo-backed opaque sessions with signed HttpOnly cookies
- [x] Same-origin Origin checks and Mongo-backed rate limits
- [x] Google redirect and ID-token sign-in routes
- [x] Owner-scoped project CRUD route handlers
- [x] Blueprint, mix-report and page-guide AI routes
- [x] Browser-local audio analysis and exports preserved
- [x] Cloudflare Worker and separate frontend/backend removed
- [x] Single root package, lockfile, CI job and Vercel deployment path
- [x] Typecheck, lint, tests and production build pass
- [x] V1.1 scope amended for browser-local single-file utilities
- [x] Audio analysis moved to a Web Worker with progress and cancel, main-thread fallback
- [x] Mix-report export carries the real model name
- [x] Removed unused duplicate blueprint types
- [x] Project page renders saved blueprint, metrics and mix report with guards and re-export
