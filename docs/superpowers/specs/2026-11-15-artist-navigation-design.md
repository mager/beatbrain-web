# Direct artist navigation

People must reach Pharrell's music from his visible name on Happy, or by searching his name. A failed credits source must not block that path. The user has delegated implementation choices and approved live deployment.

Use the existing Spotify catalog connection in Occipital for artist search and an artist page with songs and releases. Runtime checks confirmed artist search, artist lookup, releases, and artist-filtered song search work with the current credentials. Match songs by exact Spotify artist ID, never name alone. Label these as songs with the artist; do not present them as production or writing credits. The separate MusicBrainz creator catalog remains held until its source works.

Use /artist/[spotifyId], link every validated song artist ID, and add an Artists group to the existing header search. Keep members in People and tracks in Music. Manual track search keeps its current response. Artist pages use the existing dark/light tokens, cover art, readable controls, internal song links, and explicit Spotify source links. Keep browsing and API access member-only.

Approaches considered: waiting for MusicBrainz leaves the path broken; external Spotify links leave Beatbrain; an in-site page using the already working catalog restores this path with bounded data requests. Choose the in-site page. No new service, database, credential, or package is needed.

Independently inspect the Happy Apple Music fallback. Only change matching or credits when real source data proves the same recording/edition; do not invent missing credits or loosen matching enough to admit remixes or covers.
