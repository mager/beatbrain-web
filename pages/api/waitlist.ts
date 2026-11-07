import type { NextApiRequest, NextApiResponse } from "next";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";
import { isOwner, PRIVATE_CACHE_CONTROL } from "../../lib/access";
import { Prisma, type WaitlistEntry } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers), query: { disableCookieCache: true } });
    if (!session) return res.status(401).json({ error: "Sign in to continue." });
    if (!isOwner(session.user)) return res.status(403).json({ error: "Only the site owner can view the waitlist." });
    const cursorID = req.query.cursor;
    if (cursorID !== undefined && (typeof cursorID !== "string" || cursorID.length > 128))
      return res.status(400).json({ error: "Invalid waitlist page." });
    const cursor = typeof cursorID === "string" ? await prisma.waitlistEntry.findUnique({ where: { id: cursorID }, select: { id: true, createdAt: true } }) : null;
    if (cursorID !== undefined && !cursor) return res.status(400).json({ error: "Invalid waitlist page." });
    // Filter members in SQL before taking a page; joined members must not hide
    // later listeners. Values remain parameters, including the cursor.
    const rows = await prisma.$queryRaw<WaitlistEntry[]>(Prisma.sql`
      SELECT w.* FROM "waitlist" w
      WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE LOWER(u.email) = w.email)
      ${cursor ? Prisma.sql`AND (w."createdAt", w.id) > (${cursor.createdAt}, ${cursor.id})` : Prisma.empty}
      ORDER BY w."createdAt" ASC, w.id ASC LIMIT 51
    `);
    const entries = rows.slice(0, 50);
    return res.status(200).json({ entries, nextCursor: rows.length > 50 ? entries[49].id : null });
  } catch {
    return res.status(503).json({ error: "The waitlist could not be loaded. Try again." });
  }
}
