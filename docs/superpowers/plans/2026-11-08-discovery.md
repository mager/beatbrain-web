# Beatbrain discovery implementation plan

> Execute inline with superpowers:executing-plans. Review the final diff independently.

## Goal and design

Discover defaults to **The room**, as selected by the user. Add **For you** and **Worldwide** as simple view buttons above the existing cover wall. Preserve the record-room design, accessibility, private browsing, and separate chronological social feed.

The room uses Beatbrain posts. Each member contributes once per track, at their latest post time. Weight recent posts with a 14-day half-life; unique members add together. Keep older posts available. Rank first, then cap each artist at two tracks. Return at most 60 tracks and a member count. Counts describe posts by members, not measured streams.

For you uses up to 100 of the signed-in member's posts and the latest 1,000 community posts. Score candidates by posted artists, artist overlap with other members, community interest, and a small worldwide baseline. Exclude already-posted tracks. Keep at most two tracks per artist and reserve every fourth place for an unseen worldwide pick when available. Return honest short reasons. New members get room picks and worldwide picks with a clear starting-state note.

Worldwide preserves the current Melodex/Occipital feed and its update date. The room must work when that upstream is unavailable. For you can use local results if worldwide fails. Empty/error states must offer a useful action. Switching modes must cancel old requests and keep the selected mode clear.

## Architecture and alternatives

Use a pure TypeScript ranker in `lib/discovery.ts`, the existing session-protected Next.js API, and PostgreSQL posts. No migration, new dependencies, model training, or Spotify scopes. This gives Beatbrain its own transparent signals now. Spotify top items require the separate `user-top-read` permission and provider access; that optional import is not represented as connected in this release. A dedicated ranking service would add work without a need at this size. Melodex stays responsible for external discovery ingestion.

## Tasks

- [x] Add failing ranking tests: fresh posts, distinct members versus repeats, deterministic order, artist diversity, personal affinity, shared taste, seen-track exclusion, exploration, empty input, invalid source IDs, missing authors and dates. Implement ranker, then run `npm test`.
- [x] Add bounded database reads, session-derived identity, strict mode validation, no-store responses, and independent worldwide fallback in `/api/discover`. Never return author IDs or private profile inputs.
- [x] Add the three controls, mode notes, track reasons, and useful empty states. Reuse the existing cover grid and buttons. Extend browser checks for mode switching, personalization after a real post, invalid requests, errors, retry, and narrow/wide layout. Run `npm test` and `npm run build`.
- [x] Review the diff, inspect desktop/mobile, run Impeccable detector, deploy Vercel, then run live discovery, launch, and song checks. Remove temporary test data and record deployment.

## Review focus

Repeated posts must not manufacture popularity. A new member must get useful tracks. A slow earlier mode must not replace the selected mode. Global outages must not remove local discovery. Stored legacy records must not produce broken track links or reveal private identifiers.

## Progress

Design follows the user's selected default and existing authorization to build and deploy. Current data: three members, 32 posts, one post in the past 30 days. No need to change GCP project.

Local verification: 33 unit tests passed; production build passed. Browser checks passed at 320–1920 px, through view switching, posting, profile, retry, and empty states. A delayed response was ignored after a mode change. A separate local server with a test-only HTTP 503 source verified that room/personal discovery still works while Worldwide returns a recoverable error. Temporary accounts/posts/invites were cleaned. Impeccable detector reported no findings. Independent review found no important defects. No plan deviations.

Deployed code commit `3e4e4ce` to `https://beatbrain.xyz` via `beatbrain-r8emv7i1v-mager1s-projects.vercel.app`. All live discovery, launch, and song-detail checks passed. Local test servers stopped. The API uses recent bounded samples (1,000 community posts and 100 personal posts); it is a transparent ranking system, not a trained model or Spotify history import.
