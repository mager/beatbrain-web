# Admin release checks — 2026-11-09

Version 1.2.0, source commit d9acee9. Vercel deployment beatbrain-c29exvs9l-mager1s-projects.vercel.app is aliased to https://beatbrain.xyz. The v1.2.0 tag is public.

- All 48 unit tests passed. Production build passed locally and on Vercel.
- SSR admin checks passed: guest redirect, member denial, stable owner ID, private no-store.
- Local browser checks passed for draft protection, accepted sends, failed sends with edits retained, uncertain delivery with status recovery, and 320/390 px layouts. Provider calls were fixtures.
- Live HTTP checks passed for guest restrictions, invited signup, email/password sign-in, owner-only admin and mail APIs, posting, profile, and sign-out. Test records were removed; three members and 32 posts remained.
- The additive invite email delivery migration is applied. No existing member or post data was removed.
- Mailjet domain verification and DKIM validation passed. Namecheap forwarding MX and its locked SPF record remain unchanged. Root SPF does not include Mailjet; Mailjet uses its own default return path, with Beatbrain DKIM for alignment.
- The live Admin sandbox check returned: Mailjet accepted the sender settings. No email was sent. This validates the configured credentials and sender, not inbox delivery.
- A real invite draft is ready for the owner to review in the open Admin tab. Draft text remains in browser memory only. No live message was sent.
- Reply forwarding for hello@beatbrain.xyz is not configured; the destination remains a user choice.

Run `npm test`, `npm run build`, and `node --env-file=.env.local --import tsx tests/admin-access-check.mjs` for local checks. The Admin Test email setup button always uses Mailjet SandboxMode. Do not use a real send as a setup test.
