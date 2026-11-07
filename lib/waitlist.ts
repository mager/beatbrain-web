import prisma from "./prisma";
import { normalizeInviteEmail } from "./invites";

type WaitlistStore = {
  upsert(args: {
    where: { email: string };
    create: { email: string; name: string };
    update: { name: string };
  }): PromiseLike<unknown>;
};

/** Better Auth supplies this source after validating the OAuth exchange. */
export async function routeNewSpotifyUser(
  { user, source }: {
    user: { email?: unknown; name?: unknown };
    source: { action: string; method: string; oauth?: { providerId: string } };
  },
  store: WaitlistStore = prisma.waitlistEntry,
) {
  if (source.action !== "create-user" || source.method !== "oauth" || source.oauth?.providerId !== "spotify") return;
  const email = normalizeInviteEmail(user.email);
  if (!email) return {
    error: "WAITLIST_EMAIL_REQUIRED",
    errorDescription: "Spotify did not supply a valid email address.",
  };
  const name = typeof user.name === "string" ? user.name.trim().slice(0, 120) : "";
  await store.upsert({ where: { email }, create: { email, name }, update: { name } });
  // Returning an error here stops account and session creation. The separate
  // waitlist write is intentional; it is not part of member provisioning.
  return { error: "WAITLIST_JOINED", errorDescription: "Your place on the waitlist is saved." };
}
