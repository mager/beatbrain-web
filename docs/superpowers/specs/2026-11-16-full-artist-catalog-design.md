# Full artist catalog

The artist page must let a member browse all available Spotify releases and all tracks on those releases that credit the exact artist ID. The previous search source returns total=5 and next=null even when an offset request returns more songs. Release browsing was also fixed at ten entries. Raw Spotify album pagination instead returns770 Pharrell entries across album,single,appears_on,compilation; G I R L exposes all11 tracks.

Use the existing Occipital Spotify connection. Page through release and album-track APIs, never use track search as the catalog. Preserve album editions; deduplicate exact track/release IDs when appending. The UI shows progress and can load another batch or continue until completion, with a Stop control. Failures stop automatic loading, retain confirmed data, and permit retry. No fake complete count: totals describe releases, song counts describe loaded unique track IDs. Spotify performing artist credits are distinct from production/writing-only credits; do not claim all production credits.

Use the current album-led design, both themes, private sessions, and current song/posting flows. No new service, credential, package, database, or destructive operation. Keep source calls bounded and cancel requests on navigation/disconnect. Use live-base isolated worktrees. Existing authorization covers implementation and deployment.

Decision: consume the release catalog instead of extending unreliable search paging or scraping artist pages. All groups are included. Songs and releases paginate independently so neither replaces the other's confirmed state.
