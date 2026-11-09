import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import prisma from "../../../lib/prisma";
import { getSession } from "../../../lib/auth-api";
import { isSameOrigin, PRIVATE_CACHE_CONTROL } from "../../../lib/access";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "POST" && req.method !== "DELETE")
    return res
      .setHeader("Allow", "POST, DELETE")
      .status(405)
      .json({ error: "Method not allowed." });
  try {
    const session = await getSession(req);
    if (!session)
      return res.status(401).json({ error: "Sign in to show some love." });
    if (!isSameOrigin(req.headers.origin))
      return res.status(403).json({ error: "Invalid request origin." });
    const raw = req.query.postId;
    if (
      typeof raw !== "string" ||
      !/^[1-9]\d{0,9}$/.test(raw) ||
      Number(raw) > 2147483647
    )
      return res.status(400).json({ error: "Choose a valid post." });
    const postId = Number(raw);
    const loved = req.method === "POST";
    const loveCount = await prisma.$transaction(async (tx) => {
      if (
        !(await tx.post.findUnique({
          where: { id: postId },
          select: { id: true },
        }))
      )
        return null;
      const relationship = { postId, userId: session.user.id };
      if (loved)
        await tx.postLove.createMany({
          data: relationship,
          skipDuplicates: true,
        });
      else await tx.postLove.deleteMany({ where: relationship });
      return tx.postLove.count({ where: { postId } });
    });
    if (loveCount === null)
      return res
        .status(404)
        .json({ error: "This post is no longer available." });
    return res.status(200).json({ loved, loveCount });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    )
      return res
        .status(404)
        .json({ error: "This post is no longer available." });
    return res
      .status(500)
      .json({ error: "Your reaction could not be saved. Please try again." });
  }
}
export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };
