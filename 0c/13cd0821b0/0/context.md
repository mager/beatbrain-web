# Session Context

**Session ID:** 1fcc9b40-3a79-4856-b6c7-d2dddea52ff9

**Commit Message:** Hey i got this error on /auth/signin when clicking the spotify link is n

## Prompt

hey i got this error on /auth/signin when clicking the spotify link is nextauth broken Request URL
https://www.beatbrain.xyz/api/auth/sign-in/social
Request Method
POST
Status Code
405 Method Not Allowed

## Summary

That should fix it. The problem: Better Auth's default `basePath` is `/api/auth`, but when Next.js Pages Router hands the request to the catch-all `pages/api/auth/[...all].ts`, the `req.url` is `/auth/sign-in/social` (stripped of the `/api` prefix). Better Auth then tries to match `/auth/sign-in/social` against its registered route `/sign-in/social` and fails with a 405.

Adding `basePath: "/api/auth"` explicitly tells Better Auth where it's mounted so it correctly strips the prefix and matches the route. Deploy that and Spotify sign-in should work.

## Key Actions

- - **Task**: Investigate auth signin 405 error
- - **Read**: /Users/magerbot/Code/beatbrain-web/lib/auth.ts
- - **Edit**: /Users/magerbot/Code/beatbrain-web/lib/auth.ts
