import assert from "node:assert/strict";
import test from "node:test";
import { inviteEmail, inviteStatus } from "../lib/invite-email";

test("draft preserves email-bound invite and gives exact expiry without claiming delivery", () => {
  const url =
    "https://beatbrain.xyz/auth/signin?invite=secret&email=friend%2Bmusic%40example.com";
  const draft = inviteEmail({
    email: "friend+music@example.com",
    url,
    expiresAt: "2026-11-16T15:55:00Z",
    sender: "mager",
  });
  assert.equal(draft.subject, "Come join me on Beatbrain");
  assert.ok(draft.body.includes(url));
  assert.ok(draft.body.includes("friend+music@example.com"));
  assert.ok(draft.body.includes("November 16, 2026"));
  assert.ok(draft.body.includes("UTC"));
  assert.ok(draft.body.includes("mager"));
});
test("invite status distinguishes consumption from account creation and expiry", () => {
  const now = new Date("2026-11-09T16:00:00Z");
  assert.equal(
    inviteStatus({ usedAt: "2026-11-08", expiresAt: "2026-11-08" }, now),
    "Used",
  );
  assert.equal(
    inviteStatus({ usedAt: null, expiresAt: "2026-11-09T16:00:00Z" }, now),
    "Expired",
  );
  assert.equal(
    inviteStatus({ usedAt: null, expiresAt: "2026-11-10" }, now),
    "Pending",
  );
});
