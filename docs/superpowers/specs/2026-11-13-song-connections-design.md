# Song connections

The user asked for a useful missing MusicBrainz feature and delegated the choice. Add compact Song connections to the current song page. Keep album art and instruments first; preserve both themes and compact credits.

## Approaches
- Recording connections (selected by the implementer): samples, remixes, and edits give people another song to explore. Use explicit MusicBrainz relationships, never guesses from names.
- Recording places: useful context, but fewer onward listening paths.
- Work details: composition language and identifiers are useful to researchers but less useful for everyday discovery.

## Behavior
Fetch recording-rels in the existing bounded MusicBrainz recording request, preserving direction and target artist credits. Expose supported samples material, remix, and edit connections with recording ID, title, artist, disambiguation, type, and direction. Drop incomplete/unknown/self relationships, deduplicate, and order deterministically. No additional per-target requests or new dependencies. Invalidate the existing versioned track cache.

Show a compact section above Releases: relationship label, linked track title, optional artist/version. Four rows initially; native details expands remaining rows. Link to existing /song/{mbid} route. Hide the whole section when absent. Link the section's MusicBrainz source for audit. Maintain original recording data if a Spotify upgrade points to a different MBID.

## Checks
Direction correctness, malformed targets, missing artist, duplicate relations, bounded requests, empty state, expand/collapse, internal links, source links, both themes, desktop and phone widths. Preserve member access and posting.

## User-approved extension: studios
The user chose recording connections, then requested studio details and delegated further choices. Also request place-rels in the same lookup. Preserve recorded/mixed/produced/engineered places, optional area, date precision, and the additional attribute. Show Studios & places below connections, with three rows and native expansion. Link exact place IDs to MusicBrainz. Hide absent data. Never infer a studio from the artist's location.

## Navigation review
Accept canonical IDs returned by MusicBrainz redirects; compare any Spotify upgrade to that canonical ID. Direct recording navigation uses the existing bounded work helper and release projection, avoiding server-side cover-art fanout.
