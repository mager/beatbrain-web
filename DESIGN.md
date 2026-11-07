# Beatbrain: the record room

The user chose a dark, album-led room with gentle 3D tilt, art-colored light, and smooth focus states. This is an operating interface: music posts and people remain the task.

## Tokens

- Background: `#101113`; surface: `#191b1f`; rule: `#303238`.
- Primary text: `#f3f0e9`; secondary text: `#aaaeb7`; accent: `#e4b6ff`.
- Type: locally served Space Grotesk, 400–700 for controls, metadata, and music. Archivo 900 italic for page headings. Body 14–16 px; music titles 15–21 px; page headings 44–96 px.
- Main measure: full viewport with 32 px edges on desktop and 16 px on mobile. Forms keep a short measure. About prose is at most 65ch.
- Artwork: square, 3 px corner. Controls: 6 px corner, 46 px minimum height.
- Post grid: fill available width with columns at least 280 px; two below 900 px, one below 600 px. Discover: five columns on desktop, six on wide displays, two on mobile. Keep author, date, title, artist, and note visible.

## Interaction

Artwork tilts at most 3.5 degrees under a mouse. A blurred copy of the cover supplies the light. Pointer leave and keyboard blur reset the angle. Touch has a static cover and a visible link control. Reduced motion disables tilt, light, and decorative animation. No autoplay audio.

## Content and access

The feed is chronological and preserves repeat posts. A profile is its feed. Every content page and API requires a verified member session. The entry page contains no member activity or artwork. Only the owner can create email-bound invitations.

## Scope

Discover is the home page and remains at /discover. Social posts have a separate /feed tab. Profile is the member’s feed. Podcasts and credits remain at their existing routes. The separate beatbrain-v2 project remains unchanged.

## Song details

Song pages use a dominant color sampled from the actual cover. Broad colored areas outrank small details; black, white, and transparent pixels do not set the accent. The accent has at least 7:1 contrast with the dark canvas and button text. Monochrome or unavailable covers use a neutral accent. The header, primary action, artist name, links, and focus marks share the song accent. Navigation away restores the site palette. No extra image service or color package is needed.

Credits read as grouped liner notes: songwriting, performance, and production. Album, release date, length, genres, known musical facts, releases, and source links accompany them. Never infer missing key, tempo, or credits. Metadata may be incomplete when a source has no matching recording.
