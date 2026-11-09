# Beatbrain

An invite-only music room. Members post a track and an optional note. Their profile is their listening feed. Album art leads the dark interface. Discover is the home page. Social posts live in `/feed`; each member also has a profile feed.

Members can follow people from their profiles. Following is directional and requires no approval. Profiles show counts and “Follows you” when the other member follows the viewer. `/feed?view=friends` shows only followed people's posts, in time order; `/feed` keeps everyone's posts. Follows never grant site access.

## Run

Copy `.env.example` to `.env.local` and set the values. Install with `npm ci`, then run `npm run dev`. Use the same host as `BETTER_AUTH_URL`. The Go API requires a server-only `BEATBRAIN_API_KEY`.

## Access

Every content page and API requires a verified database session. Only the sign-in page, required auth endpoints, and static assets are public. Spotify sign-in works for existing linked accounts. New Spotify listeners join a separate waitlist: they do not receive a member account, Spotify token storage, or a session.

The owner can view the waitlist in Admin and create the same email-bound invites. Repeat Spotify requests preserve the original wait time and invite status. The list excludes people who have joined and loads 50 entries at a time. Beatbrain's Spotify app is currently in Development mode, which permits only five approved Spotify users. An open Spotify waitlist requires a change to that provider limit; the app cannot bypass it.

The owner is the existing stable user ID `4`. In `/admin`, the owner can create an email-bound invitation, review its email, and send it through Mailjet. Set server-only `MAILJET_API_KEY`, `MAILJET_API_SECRET`, `MAILJET_FROM_EMAIL`, and `MAILJET_FROM_NAME` in Vercel. Verify the sender domain in Mailjet. The Admin setup test uses sandbox mode and never sends mail. Delivery state prevents duplicate sends after an accepted or uncertain result. Draft text and plaintext invite tokens are not stored. Invites expire after seven days and work once. The database stores only a hash of the token. A failed account insert consumes the token; create another invitation if needed.

All three original member rows are preserved. Two legacy members have no linked login account and need a separate account-recovery task before they can sign in. Do not delete or replace their existing data.

## Checks

- `npm test`: access, invitation, and post-input checks.
- `npm run build`: type check and production build.
- `node --env-file=.env.local tests/launch-check.mjs`: browser and API integration checks against a running localhost:3000 instance. Requires local Chrome. Creates a temporary invite, member, and posts, then removes them. To test production, set `TEST_BASE_URL=https://beatbrain.xyz`.

The integration test checks guest/forged-cookie rejection, invited signup, member restrictions, post ownership, repeat listens, profile privacy, search through Go, responsive layout, artwork tilt, reduced motion, and sign-out.

- `node --env-file=.env.local tests/discover-check.mjs`: checks live discovery, retry and empty states, About, desktop/mobile layouts, and posting from a track page. It also creates and removes a temporary invited member.

- `node --env-file=.env.local tests/song-details-check.mjs`: checks real credits, album/duration/releases, dynamic cover accents, theme reset, and responsive song pages.

- `node --env-file=.env.local tests/profile-view-check.mjs`: checks the responsive cover grid, saved Grid / Feed choice, notes, and track links. It creates and removes its own invited member and posts. Set `TEST_BASE_URL=https://beatbrain.xyz` to check production.

- `node --env-file=.env.local tests/friends-check.mjs`: creates three temporary invited members and checks follow/unfollow, actor and origin protection, duplicate requests, self-follow prevention, mutual status, Friends feed isolation, failure recovery, keyboard controls, and desktop/mobile profiles. It removes its relationships, members, posts, and invites. Use `TEST_BASE_URL=https://beatbrain.xyz` for production and run it sequentially with other signup tests.

- `node --env-file=.env.local tests/compose-check.mjs`: checks album colors and reset, desktop/mobile layout, keyboard Change track, note retention, failed-post recovery, real posting, and missing artwork. It removes its invited test member and posts. Set `TEST_BASE_URL=https://beatbrain.xyz` for production. Run browser signup suites sequentially on production to respect the auth rate limit.

- `node --env-file=.env.local --import tsx tests/waitlist-oauth-check.mjs`: runs real auth callbacks against the database with mocked Spotify responses; checks state, consent denial, waitlist isolation, duplicates, and existing member sign-in.
- `node --env-file=.env.local --import tsx tests/waitlist-owner-check.mjs`: checks owner access, pagination past 100 entries, and invite writes against the database with a mocked session identity.
- `node --env-file=.env.local tests/waitlist-ui-check.mjs`: checks public entry and confirmation, OAuth start, guest/member restrictions, and desktop/mobile owner controls. Owner UI responses are fixtures; it does not impersonate a real owner session. Set `TEST_BASE_URL=https://beatbrain.xyz` for production. All three checks remove their test records.

## Deploy

Vercel project: `beatbrain-web`. Canonical URL: `https://beatbrain.xyz`. `www` redirects to the canonical URL. Set the production environment values in Vercel, then use `vercel deploy --prod` from this folder. Apply reviewed additive migrations before code that uses them. Never reset the existing database.

Occipital runs in `beatbrain-dev`, `us-central1`. Its API key is in Secret Manager (`beatbrain-api-key`) and the same value is set in Vercel. Browser code must use Next.js API routes; it must never receive the key.

The workspace root `../AGENTS.md` maps all microapps. `../../beatbrain-v2` is a separate prototype; this launch did not change it.
