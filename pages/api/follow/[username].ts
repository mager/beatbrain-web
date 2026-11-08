import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getSession } from "../../../lib/auth-api";
import { isSameOrigin, PRIVATE_CACHE_CONTROL } from "../../../lib/access";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res
      .setHeader("Allow", "POST, DELETE")
      .status(405)
      .json({ error: "Method not allowed" });
  }
  try {
    const session = await getSession(req);
    if (!session)
      return res.status(401).json({ error: "Sign in to follow people." });
    if (!isSameOrigin(req.headers.origin))
      return res.status(403).json({ error: "Invalid request origin." });
    const username = req.query.username;
    if (
      typeof username !== "string" ||
      !/^[a-zA-Z0-9_]{3,30}$/.test(username)
    ) {
      return res.status(400).json({ error: "Choose a valid username." });
    }
    const target = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!target)
      return res.status(404).json({ error: "This member is not available." });
    if (target.id === session.user.id)
      return res.status(400).json({ error: "You cannot follow yourself." });
    const following = req.method === "POST";
    const followerCount = await prisma.$transaction(async (tx) => {
      const relationship = {
        followerId: session.user.id,
        followingId: target.id,
      };
      if (following)
        await tx.follow.createMany({
          data: relationship,
          skipDuplicates: true,
        });
      else await tx.follow.deleteMany({ where: relationship });
      return tx.follow.count({ where: { followingId: target.id } });
    });
    return res.status(200).json({ following, followerCount });
  } catch {
    return res
      .status(500)
      .json({ error: "Your follow could not be updated. Please try again." });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };
