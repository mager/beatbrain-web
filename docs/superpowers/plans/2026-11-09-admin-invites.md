# Owner admin and invite email drafts

Goal: give the owner a clear Admin page for invites, the waitlist, and editable email drafts.

The existing owner ID4 and invite/waitlist APIs remain authoritative. Move owner controls from Settings to /admin; check owner access on the server and keep private no-store responses. Keep profile settings separate. Add a 50-row recent-invite list with Pending, Used, and Expired states. Never show token hashes or claim that a used invite necessarily means a completed signup.

Use the existing mail app for delivery unless the user requests a provider. Creating a draft creates an email-bound invite and shows the exact recipient, editable subject/body, expiry, and link. Opening mail or copying text does not send mail. Keep draft data in page memory; no new storage of plaintext invite tokens. Existing links cannot be recovered from their hashes; tell the owner that a new draft creates a new link.

- [ ] Add failing tests for draft content, encoded mail URLs, invite status, and owner page access.
- [ ] Add Admin UI and server guard, move Settings controls, add owner navigation, and keep error/retry/keyboard/mobile behavior.
- [ ] Build, run tests, inspect desktop/mobile, and obtain review.
- [ ] Update version/changelog, push, deploy, and verify live access boundaries and owner UI.
- [ ] Prepare the requested Drew message without sending it.

Ruling: user selected direct delivery via Mailjet. Replace mailto with explicit Send invite after editable preview. Keys server-only in Vercel; no mail sent by draft creation. Add persistent delivery state and a conditional one-at-a-time claim; accepted sends cannot resend, definite rejects may retry, uncertain outcomes must be checked before further action. Keep plaintext tokens/body out of DB. Provider status does not claim inbox delivery. User added API keys; domain and sender setup in progress.

Browser review reproduced draft replacement through Waitlist. Fixed by locking both create paths while a draft exists and requiring explicit discard; tested edit preservation, copied content, failure/retry, Waitlist draft, and320/390 layout in an isolated component preview with fake APIs.
