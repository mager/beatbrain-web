import type { NextApiRequest, NextApiResponse } from "next";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";
import { isOwner, isSameOrigin, PRIVATE_CACHE_CONTROL } from "../../lib/access";
import { newInvite, normalizeInviteEmail } from "../../lib/invites";
import { getMailjetSettings } from "../../lib/mailjet";

const inviteFields = {
  id: true,
  email: true,
  createdAt: true,
  expiresAt: true,
  usedAt: true,
  emailStatus: true,
  emailSentAt: true,
  emailAttemptedAt: true,
  emailMessageId: true,
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
      query: { disableCookieCache: true },
    });
    if (!session)
      return res.status(401).json({ error: "Sign in to continue." });
    if (!isOwner(session.user))
      return res
        .status(403)
        .json({ error: "Only the site owner can manage invitations." });
    if (req.method === "GET") {
      const invites = await prisma.invite.findMany({
        select: inviteFields,
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return res.status(200).json({ invites, mail: getMailjetSettings() });
    }
    if (!isSameOrigin(req.headers.origin))
      return res
        .status(403)
        .json({ error: "This request must come from Beatbrain." });
    const email = normalizeInviteEmail(req.body?.email);
    if (!email)
      return res.status(400).json({ error: "Enter a valid email address." });
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing)
      return res
        .status(409)
        .json({ error: "This person is already a member." });
    const { token, data } = newInvite(email, session.user.id);
    const invite = await prisma.$transaction(async (tx) => {
      const created = await tx.invite.create({ data, select: inviteFields });
      await tx.waitlistEntry.updateMany({ where: { email }, data: { invitedAt: new Date() } });
      return created;
    });
    const url = new URL(
      "/auth/signin",
      process.env.BETTER_AUTH_URL || "https://beatbrain.xyz",
    );
    url.searchParams.set("invite", token);
    url.searchParams.set("email", email);
    return res.status(201).json({ invite, url: url.toString() });
  } catch {
    return res
      .status(500)
      .json({ error: "The invitation could not be saved. Try again." });
  }
}
