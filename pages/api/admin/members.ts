import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/auth-api";
import { isOwner, PRIVATE_CACHE_CONTROL } from "../../../lib/access";
import prisma from "../../../lib/prisma";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "GET")
    return res
      .setHeader("Allow", "GET")
      .status(405)
      .json({ error: "Method not allowed" });
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Sign in to continue." });
  if (!isOwner(session.user))
    return res.status(403).json({ error: "Owner access required." });
  const cursor = req.query.cursor;
  if (
    cursor !== undefined &&
    (typeof cursor !== "string" || !cursor || cursor.length > 128)
  )
    return res.status(400).json({ error: "Invalid page." });
  try {
    const rows = await prisma.user.findMany({
      take: 51,
      orderBy: { id: "asc" },
      ...(typeof cursor === "string"
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        email: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    });
    const members = rows.slice(0, 50);
    return res.json({
      members,
      nextCursor: rows.length > 50 ? members[49].id : null,
    });
  } catch {
    return res
      .status(503)
      .json({ error: "Members could not be loaded. Try again." });
  }
}
