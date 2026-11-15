# Creator Catalog Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline execution. The user delegated execution choices.

**Goal:** Let members explore a creator's verified roles, group connections, and music, starting with Pharrell.
**Architecture:** Extend the existing Go creator response with a normalized catalog and connections. The private Next.js API validates requests; the creator UI filters and pages the returned catalog. Load optional ListenBrainz discovery independently.
**Tech Stack:** Go, Next.js, TypeScript, React, CSS modules.
**Spec:** `docs/superpowers/specs/2026-11-14-creator-catalog-design.md`

## Global Constraints

- Preserve current local changes, member access, and manual posting.
- No deployment is part of this change.
- A group credit remains on the group's page; it is not copied into an individual's credits.
- Do not call Spotify top tracks a production catalog.
- Missing artist/date/cover data stays honest.

## Review Focus

- Repeated credits must not inflate the result count; different recording versions stay distinct.
- Group membership must preserve direction, dates, and credited group identity.
- Route changes and failed requests must not retain the previous creator's results.
- A provider failure must not appear as an empty successful catalog or erase available music.
- All reads remain private; invalid IDs and array query values never reach upstream services.

### Task 1: Creator data

Files: `occipital/musicbrainz/creator_context.go`, `occipital/handler/creator/creator.go`, `occipital/occipital/occipital.go`, and focused Go tests.
Interface: existing `{creator}` response gains `catalog` entries (ID, kind, title, artists, roles, date, disambiguation), `connections` (ID, name, relation, dates), and source URL. Retain existing fields for compatibility.
- [x] Add handler fixtures that prove roles, deduplication, release/work boundaries, group direction, invalid input, and failure responses. Run and observe failure.
- [x] Implement bounded fetching, mapping, and fixed-size metadata caching.
- [x] Run Go tests and vet.

### Task 2: Private API and catalog UI

Files: `lib/creator-catalog.ts`, `lib/types.ts`, creator API/page, `components/Credits.tsx`, and a creator CSS module.
Interface: normalized catalog from Task 1; GET creator API returns that creator or stable JSON error. Role links use `?role=production` etc. Pure filtering returns distinct matching entries, sorted by known date or title.
- [x] Add failing API tests for session checks, invalid input, upstream error/malformed success, and query protection. Add filtering tests for roles, missing data, versions, and search.
- [x] Implement API boundary, role links, catalog controls, pagination, connections, source links, and error recovery.
- [x] Add optional verified ListenBrainz discovery with independent error handling and tests.
- [x] Run frontend tests and production build.

### Task 3: Browser checks and review

- [x] Verify real source data where reachable; use explicit fixtures for edge states.
- [x] Inspect desktop and 390/320 px mobile layouts in both themes; test keyboard, filters, more results, route changes, retry, song links, and existing posting path.
- [x] Request an independent code/design review, apply material fixes, and recheck affected behavior.
- [x] Record results and remaining provider limitations. Leave changes reviewable in the working tree.

## Execution record

Ruling: work on existing feature branches in place, with new module styles and targeted files — preserves current frontend discovery work and avoids copying environment files. No shared-library edits are needed.
Baseline: frontend 72 tests passed using `node --import tsx --test tests/*.test.ts` (the npm/tsx launcher IPC is sandbox-blocked). Existing Go tests passed; sandbox denied its final cache trim, so final Go checks will use approved execution.

Ruling: Occipital owns ListenBrainz requests and caches as well as MusicBrainz — the user explicitly requested service reuse for speed. Next.js only checks membership, validates queries, and projects the returned data. Exact-recording metadata is loaded in batches of at most 24; no new scraping or Melodex job is needed.
Ruling: preserve all known credit kinds and show missing data honestly. Title and artist sorting are available; a global year sort is deferred because MusicBrainz's related-recording objects omit release dates.
Task 1: complete — Go creator tests and full tests/vet passed. Added bounded caches and shared concurrent reads; no shared musicbrainz-go checkout edits.
Task 2: complete — role/search/filter tests, private API tests, and source-normalization tests passed. Live MusicBrainz returned 445 distinct recording credits, 594 compositions, 17 releases, and six group memberships for Pharrell.
Task 3: complete — live browser journey passed through Pharrell production/performance filters, The Neptunes/Milkshake, song navigation, temporary manual posting, and profile. Desktop and 390/320 px mobile captures in both themes completed, including keyboard access to early group links. Independent code/design review passed after fixes for fallback-artist search and malformed provider payloads.

Final checks: `npm test` passed all 78 tests; `npm run build` passed; Occipital `go test ./...` and `go vet ./...` passed; both repositories passed `git diff --check`. A concurrent task replaced shared `.next` files during the first production browser attempt. A separate temporary source copy built successfully and passed `node tests/creator-check.mjs` against the local Occipital handlers. The script removed its temporary member, session, and posts. No deployment, schema change, or production configuration change was made.

Limits: these are known source credits, not a claim of a complete discography. Group credits stay on the group's page. Optional artwork and suggestions can fail without hiding the catalog. Caches are per Occipital process; Melodex and scraping are unchanged.

## Release follow-up — 2026-11-15

The user authorized push and live deployment. The frontend release uses a separate worktree based on public v1.9.5, preserving that footer fix and excluding unrelated local discovery/About edits. Version 1.10.0 passed all 77 tests in this release tree and the production build. The earlier 78-test count included one test from the unrelated discovery work. Occipital commit 88632a0 passed tests, vet, the local build, and Cloud Build. Deploy Occipital first, then the frontend after pushing the version tag; verify the public domain, private access, sign-in, creator journey, posting, and profile.

### Live release hold

The frontend release commit and public `v1.10.0` tag are pushed. Vercel built `https://beatbrain-da7bjmpqv-mager1s-projects.vercel.app` successfully with production settings and without promoting the public domains. Occipital commit `88632a0` is pushed and its Cloud Build passed.

Do not promote this release until the source connection check passes. The no-traffic Cloud Run revisions returned HTTP 503 because MusicBrainz and ListenBrainz HTTPS connections ended with EOF. Tests of Go TLS compatibility settings, Cloud Run generation, and container users did not resolve it. A separate Go/curl job initially succeeded; later the exact probe and curl also failed, so the tests did not prove a code or image defect. Do not infer an IP ban without provider evidence. Certificate verification stayed enabled.

Live traffic was never moved from `occipital-latina-credits-20261113`; `beatbrain.xyz` was not promoted. The temporary diagnostic job was removed. Once source requests succeed from the production runtime, verify the creator catalog and discovery routes, switch Occipital traffic, promote the built Vercel deployment, then run `TEST_BASE_URL=https://beatbrain.xyz node tests/creator-check.mjs` and a real sign-in check. Preserve existing member rows and remove only temporary test data.
