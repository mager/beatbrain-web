# Beatbrain: the record room

The user chose a dark, album-led room with gentle 3D tilt, art-colored light, and smooth focus states. This is an operating interface: music posts and people remain the task.

## Tokens

- Background: `#101113`; surface: `#191b1f`; rule: `#303238`.
- Primary text: `#f3f0e9`; secondary text: `#aaaeb7`; accent: `#e4b6ff`.
- Typeface: locally served Space Grotesk, 400–700. Body 14–16 px; post title 19–21 px; desktop page title up to 61 px.
- Main measure: 1200 px content plus 32 px edge padding. Mobile edge: 20 px.
- Artwork: square, 3 px corner. Controls: 6 px corner, 46 px minimum height.
- Post grid: three columns on desktop, two below 900 px, one below 600 px. Keep author, date, title, artist, and note visible.

## Interaction

Artwork tilts at most 3.5 degrees under a mouse. A blurred copy of the cover supplies the light. Pointer leave and keyboard blur reset the angle. Touch has a static cover and a visible link control. Reduced motion disables tilt, light, and decorative animation. No autoplay audio.

## Content and access

The feed is chronological and preserves repeat posts. A profile is its feed. Every content page and API requires a verified member session. The entry page contains no member activity or artwork. Only the owner can create email-bound invitations.

## Scope

Discovery, podcasts, and credits remain at their existing routes. They are secondary to posting. The separate beatbrain-v2 project remains unchanged.
