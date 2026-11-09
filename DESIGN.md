# Beatbrain: the record room

The user chose a dark, album-led room with gentle 3D tilt, art-colored light, and smooth focus states. This is an operating interface: music posts and people remain the task.

## Tokens

- Background: `#101113`; surface: `#191b1f`; rule: `#303238`.
- Primary text: `#f3f0e9`; secondary text: `#aaaeb7`; accent: `#e4b6ff`.
- Type: locally served Space Grotesk, 400–700 for controls, metadata, and music. Archivo 900 italic for page headings. Body 14–16 px; music titles 15–21 px; page headings 44–96 px.
- Main measure: full viewport with 32 px edges on desktop and 16 px on mobile. Forms keep a short measure. About prose is at most 65ch.
- Artwork: square, 3 px corner. Controls: 6 px corner, 46 px minimum height.
- Post grid: fill available width with columns at least 280 px; two below 900 px, one below 600 px. Discover: six columns on desktop, four or three at intermediate widths, two on mobile. Its first cover spans two columns and two rows on larger screens, and the full width on phones. Its title uses the display face and a direct posting link. Source order stays intact; size does not imply a chart rank. Keep author, date, title, artist, and note visible.

## Interaction

Artwork tilts at most 3.5 degrees under a mouse. A blurred copy of the cover supplies the light; a faint sleeve reflection stays inside the art. Pointer leave and keyboard blur reset the angle and reflection position. Touch has a static cover. Keyboard focus is visible. Reduced motion disables tilt, light, reflection, and decorative animation. No autoplay audio. The opening Discover cover loads eagerly; other covers remain lazy.

## Content and access

The feed is chronological and preserves repeat posts. A profile is its feed. Every content page and API requires a verified member session. The entry page contains no member activity or artwork. Only the owner can create email-bound invitations.

Profiles open as a compact cover grid: eight columns on wide desktops, six or four at intermediate widths, and three on phones (two on very narrow screens). Keep track titles and artists below the covers. Grid / Feed buttons switch to a single column of posts with dates and notes. The browser remembers the view choice; both views keep the same chronological posts, including repeat listens.

Profiles show follower/following counts below the handle. Other members have a Follow/Following button with a visible selected state and a quiet “Follows you” note for a reciprocal follow. Keep pending controls disabled and preserve the last confirmed state on failure. Following needs no approval and grants no site access. Feed keeps Everyone as its default; Friends shows only followed people, in time order, with a clear path back to Everyone when empty.

Profile identity and the view switch share a desktop row. The name uses the display face at up to 68 px. On mobile the view switch sits below the identity, aligned to the covers. The main header provides the posting action.

## Scope

Discover is the home page and remains at /discover. Social posts have a separate /feed tab. Profile is the member’s feed. Podcasts and credits remain at their existing routes. The separate beatbrain-v2 project remains unchanged.

Discover opens with The room, ranked from Beatbrain posts. For you uses the member's posted artists and shared taste; Worldwide keeps the external discovery feed. Three quiet pressed-state buttons sit below the heading and before the cover wall. A short note explains the active view. Member counts and personal reasons stay below track details. Keep request cancellation, error recovery, empty-state posting, and visible keyboard focus. The first cover is the top-ranked result within the selected view.

## Posting

Searching stays at a readable form width. Once a track is selected, its cover and note form fill two columns on desktop and stack on mobile. Reuse the song artwork's color sampling and image fallback. Keep one page-level heading; the selected track is an h2. Changing tracks restores search focus and the normal site palette. Preserve the note when changing tracks or when posting fails. A profile's list view places the author, date, title, and artist beside the cover, with the note below them; on phones, longer notes span the row.

## Song details

Song pages use a dominant color sampled from the actual cover. Broad colored areas outrank small details; black, white, and transparent pixels do not set the accent. The accent has at least 7:1 contrast with the dark canvas and button text. Monochrome or unavailable covers use a neutral accent. The header, primary action, artist name, links, and focus marks share the song accent. Navigation away restores the site palette. No extra image service or color package is needed.

Credits read as grouped liner notes: songwriting, performance, and production. Album, release date, length, genres, known musical facts, releases, and source links accompany them. Never infer missing key, tempo, or credits. Metadata may be incomplete when a source has no matching recording.

## Reactions and release footer

Each post has one small heart control with its love count. Selected hearts use the room accent. Keep a 44 px touch target, a pressed state, pending lock, and an inline retry error. Reactions retain their confirmed state when switching a profile between Grid and Feed. At mobile widths, the heart sits below the note. Profiles show the stored join month and year in UTC.

A quiet fixed footer stays at the bottom of the viewport. Measure its wrapped height and reserve that space in the page, including the device safe area. Keep the Chicago credit, an explicit About Beatbrain link, and a version link to the same release's public GitHub changelog. Read the version from package.json; create the matching Git tag before deployment.

## Admin

Only the owner sees Admin. Put invite preparation and email review beside recent invites and the waitlist on desktop; stack them on phones. Protect the current draft until it is sent or explicitly discarded. Keep recipient and link read-only. Show send failure beside the draft, and use a status check after an uncertain send. The email setup check sends no mail.

## Radiant record

About pairs its heading with one silent WebGL record: fine grooves, flowing violet/cyan/amber light, and a dark spindle. Mouse position shifts the light and tilt; touch keeps the autonomous composition. The visual stacks below the heading on phones. Keep a visible pause/play control, start still for reduced motion, stop when hidden or offscreen, cap animation at 30 fps and the drawing buffer at 900 px per edge. A static SVG record remains if WebGL fails. The effect uses no audio input, tracking, or new package.
