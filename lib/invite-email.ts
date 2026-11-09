export type EmailDraft = { email: string; subject: string; body: string };

export function inviteEmail({
  email,
  url,
  expiresAt,
  sender,
}: {
  email: string;
  url: string;
  expiresAt: string;
  sender: string;
}): EmailDraft {
  const expiry = new Date(expiresAt).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
  return {
    email,
    subject: "Come join me on Beatbrain",
    body: `Hey,\n\nCome join me on Beatbrain — a small listening room for music friends.\n\nPost what you’re playing, find new tracks, and show some love when a friend posts a great song.\n\nYour invite:\n${url}\n\nSign up with ${email}. This link works once and expires ${expiry}. You can use email and a password; Spotify is optional.\n\nSee you in the room,\n${sender}`,
  };
}

export function inviteStatus(
  invite: { usedAt: string | null; expiresAt: string },
  now = new Date(),
): "Used" | "Expired" | "Pending" {
  if (invite.usedAt) return "Used";
  return new Date(invite.expiresAt) <= now ? "Expired" : "Pending";
}
