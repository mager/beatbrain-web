# Direct Artist Navigation Implementation Plan

> Work is split by independent file ownership with the parallel debugging skill. A separate review checks the combined result before release.

**Goal:** Open a usable Pharrell artist page from Happy or search, with verified credits when available.
**Architecture:** Occipital owns Spotify catalog calls and bounded shared caches. Next.js keeps session-protected proxy routes, artist links, search, and an album-led page. Credits load independently.
**Tech Stack:** Existing Go/Spotify SDK, Next.js/React, TypeScript, CSS.
**Spec:** docs/superpowers/specs/2026-11-15-artist-navigation-design.md

## Global Constraints
- Preserve invite-only access, all members, manual posting, both themes and current contrast.
- GCP beatbrain-dev/us-central1; no new secrets, data resets, or destructive migrations.
- Work from live sources: web bac9880; Occipital 9cc0899. Do not deploy the held creator release.
- Keep secrets out of logs/Git/uploads. Push the web version tag before deployment.

## Review Focus
- Namesakes and covers: songs must include the exact artist ID.
- Partial source failure: usable artist identity remains; optional missing sections show a retry.
- Old track-only search callers retain their response shape.
- Rapid search/route changes must not show old responses or unbounded requests.
- Artist links need valid IDs; text-only data remains readable without a false link.

### Task 1: Occipital artist catalog and search
- [ ] Test and implement optional POST /spotify/search type=all (or artist) with artists [{id,name,image,url}], keeping default track response.
- [ ] Test and implement GET /artist?spotifyId=ID&offset=N. Return {artist:{id,name,image,url,genres:[]},tracks:SearchTrack[],albums:[{id,name,image,url,release_date,album_type}],next_offset:number|null,unavailable:Array<'tracks'|'albums'>}.
- [ ] Use search pages of 10, exact artist ID filtering, bounded offsets (0..990), 6-second shared loads, capped 5-minute cache and no caching of partial failures. Artist lookup is required; albums/tracks may fail independently. Canonical Spotify links only.
- [ ] Run Go tests/vet/build and review. Deploy a tagged revision without public traffic, then verify real Pharrell results before moving traffic.

### Task 2: Website artist path
- [ ] Add safe Artist payload types/validation and private GET /api/artist proxy with ID/offset validation and stable errors.
- [ ] Extend combined search to Artists, People and Music with one combined Occipital search. Preserve track-only composer behavior and partial results.
- [ ] Add /artist/[spotifyId] with artist identity, a Songs section, releases, pagination, source links and accessible loading/error states.
- [ ] Link validated Spotify IDs in song artist names. Reuse TrackHero with optional ReactNode artist content, preserving other consumers.
- [ ] Test API access/errors and wrong-identity payloads; browser Happy -> Pharrell -> song -> post, search -> Pharrell, keyboard, both themes at 1440/390/320.

### Task 3: Happy credits fallback
- [ ] Reproduce against the exact Spotify Happy ID 60nZcImufyMA1MKQY3dcCH and Apple's real catalog/page.
- [ ] If source evidence identifies a safe matching defect, add a failing fixture test then make the narrow fix. Preserve wrong-edition, wrong-artist, duration, explicitness, and ambiguity rejection.
- [ ] Test/vet with Task 1. If no valid source match exists, document that limit and keep artist navigation independent.

### Release
- [ ] Fresh branch review, npm test/build, Go test/vet/build.
- [ ] Push source branches; choose unused web version after checking remote tags; push tag before auto-deploy.
- [ ] Verify public domain, new API/search, sign-in, posting/profile and phone layouts. Remove test data.
