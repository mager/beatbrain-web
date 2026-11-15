# Creator catalog

The user delegated scope and implementation after choosing Pharrell as the test creator. Start with the creator catalog, then use it as the foundation for social onboarding. Build in the existing Next.js and Go services. Preserve current local changes, member access, and manual posting. No deployment is part of this change.

## Approaches

- Selected by the implementer under the user's delegation: extend creator catalogs first. This gives members a useful song-to-creator-to-song path with less change to onboarding and the home page.
- A larger connected-discovery release would also change onboarding and member recommendations. Defer that work until the catalog path is reliable.

## Behavior

Keep every known direct MusicBrainz recording credit, with its exact role and attributes. Also show release and composition credits as separate kinds. Deduplicate by entity kind and ID, preserve distinct recordings, and never merge creators by name. Search titles, artists, and roles; filter by kind and role; show results in bounded pages. Add artist links and group/member links, including membership dates. A group credit remains on the group's page; it is not copied into an individual's credits. Entering from a song's producer role selects production credits.

Use a bounded, cancelable MusicBrainz request through the existing paced transport. Cache successful public creator metadata briefly with a fixed entry bound. Do not call Spotify top tracks a production catalog. Preserve stable JSON errors and provide visible loading, retry, empty, and no-match states.

Use ListenBrainz artist radio as a separate, optional discovery source after verifying its response format. Label recommendations separately from confirmed credits, and keep catalog use independent of provider failure. Keep source links visible. Recording results open existing song pages, which provide the posting path. Release/work results open their exact MusicBrainz pages until those entities have local pages.

Keep Beatbrain's existing dark/light theme, heading font, album art, quiet controls, and accessible focus. Use a compact cover/list catalog with artwork where verified data supplies it, no guessed covers. Isolate styles in a CSS module. Preserve the existing global CSS changes.

## Acceptance

Pharrell production includes Alright; Get Lucky's vocal credit does not become production; Neptunes and N.E.R.D membership links remain distinct. Missing artist/date/cover data stays honest. Tests cover malformed IDs, session checks, provider errors, exact roles, multiple roles per recording, group direction/dates, filtering, page reset, route changes, and mobile/desktop layouts. Run the frontend suite/build and Go tests/vet; inspect rendered pages. Use real-source checks when providers are reachable and report any limits.
