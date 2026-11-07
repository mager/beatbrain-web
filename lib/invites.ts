import { createHash, randomBytes } from "node:crypto";
import prisma from "./prisma";

export function normalizeInviteEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newInvite(email: string, createdBy: string, now = new Date()) {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    data: {
      email,
      createdBy,
      tokenHash: hashInviteToken(token),
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  };
}

type InviteClaimStore = {
  updateMany(args: {
    where: {
      tokenHash: string;
      email: string;
      usedAt: null;
      expiresAt: { gt: Date };
    };
    data: { usedAt: Date };
  }): PromiseLike<{ count: number }>;
};

/** The database conditional update is the race gate. Never release a used token. */
export async function claimInvite(
  token: unknown,
  emailValue: unknown,
  store: InviteClaimStore = prisma.invite,
  now = new Date(),
): Promise<boolean> {
  const email = normalizeInviteEmail(emailValue);
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token) || !email)
    return false;
  const claimed = await store.updateMany({
    where: {
      tokenHash: hashInviteToken(token),
      email,
      usedAt: null,
      expiresAt: { gt: now },
    },
    data: { usedAt: now },
  });
  return claimed.count === 1;
}
