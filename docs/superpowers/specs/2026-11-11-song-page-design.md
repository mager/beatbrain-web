# Song page design

Approved in chat on 2026-11-11.

Keep the dark, cover-led design. Place instruments directly below the artist,
beside the cover on desktop. Each instrument has its original illustrated icon,
a text label, and player names. Place compact song facts and actions below.
Use a smaller cover on phones so instruments appear sooner.

Group remaining writing and production credits by person, with their roles and
small icons below their name. Preserve creator links and all source roles.
Use stable IDs to combine credits; do not infer aliases or combine different IDs.
Keep releases secondary, followed by existing sources and recording details.
Preserve empty/error states, member access, posting, and artwork color sampling.

Approaches: the user selected grouping by person to reduce repeated names.
Grouping by role would retain more of the existing table but repeat names.
No new dependencies, backend changes, or deployment are needed.

## Added user requests

Use the system light/dark theme by default and save an explicit footer light-switch choice. Use GitHub and X icons with accessible labels. Footer copy: “Built with 💜 in Chicago by @mager with help from magerbot”. User requested push to main after checks; release as 1.8.0 with the public tag pushed before deployment.
