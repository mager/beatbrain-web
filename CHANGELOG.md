# Changelog

Beatbrain is an invite-only social music site. Album art leads. Your profile is your feed.

## 1.7.0 — 2026-11-11

- Meet members on Humans, with recent album covers, profile photos, and clear links to their profiles.
- Search by name, handle, or posted artist. Filter by people you follow or members who posted in the last 30 days.
- Sort by post count, name, or join date, and load more members without losing your filters.
- Keep member browsing private, with safe profile fields, retry controls, and layouts for desktop and phones.

## 1.6.1 — 2026-11-09

- Restore credits when a single has moved to an album, only when two matching album editions agree on every credit.
- Match both credited and current MusicBrainz artist names, while keeping ambiguous recordings rejected.
- Refresh the metadata cache so previously missing credits can be checked again.

## 1.6.0 — 2026-11-09

- Find additional songwriters, performers, producers, and engineers through strictly matched Apple Music song credits, with source links.
- Keep failed credit lookups retryable and collect writers from all linked MusicBrainz works.
- Show all track artists, explicit labels, track numbers, record labels, and release copyrights when available.
- Stop audio-analysis calls by default where Spotify access is unavailable.
- Replace Reddit with Apple Music's US Top 50 in Worldwide discovery, and list the music sources.
- Repair Pitchfork ingestion, refresh Spotify server tokens, and separate the daily music job from podcast discovery.

## 1.5.0 — 2026-11-09

- Show saved Spotify profile photos in Settings and beside track posters, with a fallback for missing images.
- Move Settings (with a cog) and owner-only Admin into the fixed footer.
- Add a private, paginated member directory with profiles, email addresses, join dates, and post counts for the owner.
- Compact the invite history and member rows on desktop and mobile.
- Add reviewed Limestone songwriting credits from Apple Music. MusicBrainz matches this recording but has no detailed credits; this entry fills that source gap, not all catalog gaps.

## 1.4.2 — 2026-11-09

- Match music through MusicBrainz's exact Spotify link before name searches, restoring credits for linked remasters such as “Band on the Run.”
- Load songwriting credits with the recording to reduce metadata requests.
- Reject conflicting links, mismatched recording codes, live/remix title differences, and incompatible durations.

## 1.4.1 — 2026-11-09

- Restore verified songwriting, performance, and production credits for “Yoda” by Tech N9ne, with an Apple Music source link.
- Distinguish a failed metadata lookup from a missing recording match or missing source credits.
- Keep reviewed credits available when MusicBrainz cannot be reached.

## 1.4.0 — 2026-11-09

- Search music and members together from the site header.
- Find people by name or handle and tracks by song or artist, with album art in one dropdown.
- Support arrow keys, Enter, Escape, clear, and retry on desktop and phones.
- Keep available results when one search source fails, and keep member emails and waitlist entries private.

## 1.3.1 — 2026-11-09

- Simplify About to two main external links: GitHub and X.
- Separate MusicBrainz credit from navigation and keep the license link intact on small screens.

## 1.3.0 — 2026-11-09

- Add a radiant, interactive record shader to About.
- Let members pause the visual; start still for reduced motion and stop rendering offscreen.
- Keep a static record when graphics are unavailable, with no audio capture or added dependencies.

## 1.2.1 — 2026-11-09

- Put GitHub and Beatbrain on X first in the footer and About links.
- Credit MusicBrainz contributors on About and link to their data licenses.
- Keep the footer links within narrow phone screens.

## 1.2.0 — 2026-11-09

- Open Admin from the owner navigation to manage invites and the waitlist.
- Review and edit invite emails, then send them directly through Mailjet.
- Track email acceptance separately from invite use. Prevent duplicate sends and keep uncertain sends from retrying automatically.
- Test the email setup without delivering a message. Keep Mailjet keys on the server.
- Protect an edited draft until it is explicitly discarded.

## 1.1.0 — 2026-11-09

- Show some love: tap the heart on a post. Tap again to remove your reaction.
- See love counts in Everyone, Friends, and both profile views.
- See each member's join month and year on their profile.
- Keep the footer in view, with About Beatbrain and a link to this changelog.
- Store reactions in Beatbrain's own database, with one love per member per post.
- Add reviewed writing and production credits for Bb trickz's “Not a Pretty Girl,” with a link to the official release source. The backend fills missing roles for that exact recording and preserves existing credits.

## 1.0.0 — 2026-11-08

- Follow your music friends and switch between Everyone and Friends in the feed.
- Discover The room's shared taste, For you, and Worldwide tracks.
- Post tracks with notes; view profiles as an album grid or a one-column feed.
- Explore song credits and cover-matched colors.
- Join through an email-bound invite. New Spotify listeners can join a separate waitlist, subject to Spotify's Development mode limits.
