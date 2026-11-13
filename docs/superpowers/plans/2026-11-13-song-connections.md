# Song connections implementation plan

> **For agentic workers:** Use superpowers:executing-plans for this compact change.

**Goal:** Let members explore MusicBrainz sample, remix, and edit links plus studio details from a song.
**Architecture:** Extend existing recording JSON parsing in Occipital and its Track response. Render a compact Next.js component using the current theme and song styles.
**Tech Stack:** Go, Next.js, TypeScript; no new dependencies.
**Spec:** ../specs/2026-11-13-song-connections-design.md

## Constraints
Preserve member access, instruments, compact credits, and user changes. Keep network requests bounded and avoid per-connection fetches. Show only supported explicit relationships. Deploy to existing beatbrain-dev/us-central1 services; tag frontend before main push.

## Review focus
- Reverse sample/remix direction must not give false credit.
- Broken targets must not produce bad links.
- Old cache entries must not hide new data.
- Missing relationships must not create empty UI.
- MBID navigation must not silently switch to another recording.

## Tasks
- [x] API: test recording relation parsing, direction, deduplication, and integration; observe failure. Implement typed relation decoding, supported connection projection, v2 assembly/cache version, and bounded direct MBID lookup. Run Go tests and vet.
- [x] Site: test normalization and rendering for missing/invalid/duplicate connections and expansion. Implement optional types, adapter, SongConnections, SongStudios with exact optional dates and additional roles, and compact CSS. Preserve MBID identity on v2 upgrade. Run frontend tests and build.
- [x] Review: inspect real source data and browser layouts on desktop/mobile and both themes, expand connections and follow a link. Review the combined diff; correct concrete defects.
- [ ] Release: build clean source exports, commit only task files, deploy API, tag and push frontend, verify live access, song connections, sign-in, posting, and profile.

## Verification record
Clean API source: Go tests, vet, and build passed. Clean frontend: 69 tests and production build passed. Browser check passed against the production API at 1440, 390, and 320 pixels in both themes, including real sample navigation, studio dates, keyboard expansion, absent sections, sign-in, manual posting, and profile. Temporary accounts/posts were removed.

Review fixes: accept canonical merged recording IDs; keep usable Spotify art; bound direct lookups and avoid cover-art fanout. Production API requires the documented Go TLS compatibility setting; see occipital/docs/METADATA.md. No credentials or unrelated user changes are included.
