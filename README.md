# Beatbrain

An invite-only music room. Members post a track and an optional note. Their profile is their listening feed. Album art leads the dark interface.

## Run

Copy `.env.example` to `.env.local` and set the values. Install with `npm ci`, then run `npm run dev`. Use the same host as `BETTER_AUTH_URL`. The Go API requires a server-only `BEATBRAIN_API_KEY`.

## Access

Every content page and API requires a verified database session. Only the sign-in page, required auth endpoints, and static assets are public. Spotify sign-in works for existing linked accounts; new Spotify signup is disabled.

The owner is the existing stable user ID `4`. In Settings, the owner can create an email-bound invitation. Send the returned link yourself: the app does not send email. Invites expire after seven days and work once. The database stores only a hash of the token. A failed account insert consumes the token; create another invitation if needed.

All three original member rows are preserved. Two legacy members have no linked login account and need a separate account-recovery task before they can sign in. Do not delete or replace their existing data.

## Checks

- `npm test`: access, invitation, and post-input checks.
- `npm run build`: type check and production build.
- `node --env-file=.env.local tests/launch-check.mjs`: browser and API integration checks against a running localhost:3000 instance. Requires local Chrome. Creates a temporary invite, member, and posts, then removes them. To test production, set `TEST_BASE_URL=https://beatbrain.xyz`.

The integration test checks guest/forged-cookie rejection, invited signup, member restrictions, post ownership, repeat listens, profile privacy, search through Go, responsive layout, artwork tilt, reduced motion, and sign-out.

## Deploy

Vercel project: `beatbrain-web`. Canonical URL: `https://beatbrain.xyz`. `www` redirects to the canonical URL. Set the production environment values in Vercel, then use `vercel deploy --prod` from this folder. Apply reviewed additive migrations before code that uses them. Never reset the existing database.

Occipital runs in `beatbrain-dev`, `us-central1`. Its API key is in Secret Manager (`beatbrain-api-key`) and the same value is set in Vercel. Browser code must use Next.js API routes; it must never receive the key.

The workspace root `../AGENTS.md` maps all microapps. `../../beatbrain-v2` is a separate prototype; this launch did not change it.
