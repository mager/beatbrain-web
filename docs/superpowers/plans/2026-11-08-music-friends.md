# Music friends implementation plan

> Execute inline with superpowers:executing-plans. The user asked us to choose, build, push, and deploy the next feature.

## Design

Follow music friends from their profiles. Following is directional and needs no approval. Profiles show follower/following counts and a quiet Follow/Following control; a reciprocal relationship shows “Follows you.” Keep the profile as the person's feed. Feed gains Everyone/Friends links. Friends shows posts from followed people only, in time order. An empty Friends view links back to Everyone so members can find people through posts and the avatar row. No public access, notifications, messages, Spotify permission change, or recommendations overhaul.

## Implementation

- [x] Write a browser/API regression that fails on the current version. Cover guest access, self-follow, unknown handles, wrong origin, idempotent follow/unfollow, personal feed isolation, reciprocal status, request failure, own profile, keyboard and mobile/wide layouts.
- [x] Add an additive Follow table: `(followerId, followingId)` primary key, reverse lookup index, foreign keys with cascade on user deletion, and a database check against self-follow. Validate the schema and build before applying only this pending migration. Existing five migrations are already applied.
- [x] Add a session-derived `/api/follow/[username]` POST/DELETE route. Check the origin, method, handle, existence, and self-follow. Make both operations idempotent. No arbitrary actor IDs accepted.
- [x] Extend profile SSR and a small FollowButton for counts, viewer state, errors, and reciprocal status. Add a bounded Friends filter to server-rendered Feed and `/api/feed`. Reuse cover and control styles. Preserve Everyone as the default and all existing social behavior.
- [x] Run tests/build, apply the additive migration, and run full local browser checks. Inspect desktop/mobile and run the Impeccable detector. Get an independent review. Push the branch, deploy production, verify live friends/discovery/launch flows, remove all temporary test data, and record the release.

## Review focus

No user can act as another follower. Guests and foreign origins cannot mutate relationships. Repeat requests cannot inflate counts. Server and API feeds must use the same signed-in viewer. Failed mutations must keep correct control state. Existing users and posts must remain intact.

## Constraints

Use the existing Next.js, Prisma, PostgreSQL, and record-room design. No new service or dependency. The owner/member/invite rules remain in force. Follow data grants no site access. Database migration is additive and does not reset data. Reuse GCP project `beatbrain-dev`.

## Progress

The original regression failed against production because the follow route did not exist. All 33 existing unit tests and the production build pass. The additive migration was applied successfully. Independent review found no important defects. Local Friends and profile browser checks pass, including self-follow database rejection, guest/origin/actor checks, duplicate requests, isolated feeds, reciprocal status, error recovery, keyboard use, and 320–1920 px layouts. The test now waits for the pending button to become enabled before keyboard retry. Impeccable detector found no issues.

Release: code `fb1d3d7` is pushed to `origin/codex/social-launch-2026-11-07` and live at `https://beatbrain.xyz`, via `beatbrain-m89hfiyax-mager1s-projects.vercel.app`. Live Friends, launch, and discovery scripts passed. Existing users/posts remain intact; temporary test data was removed and the local server stopped. No plan deviations.
