import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getSession } from "../../../lib/auth-api";
import { isSameOrigin } from "../../../lib/access";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE")
    return res
      .setHeader("Allow", "DELETE")
      .status(405)
      .json({ error: "Method not allowed" });
  const session = await getSession(req);
  if (!session)
    return res.status(401).json({ error: "Sign in to delete a post." });
  if (!isSameOrigin(req.headers.origin))
    return res.status(403).json({ error: "Invalid request origin." });
  const id = Number(req.query.id);
  if (!Number.isSafeInteger(id) || id < 1)
    return res.status(400).json({ error: "Invalid post." });
  const result = await prisma.post.deleteMany({
    where: { id, authorId: session.user.id },
  });
  if (!result.count) return res.status(404).json({ error: "Post not found." });
  return res.status(204).end();
}
