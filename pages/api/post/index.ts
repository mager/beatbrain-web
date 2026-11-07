import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getSession } from "../../../lib/auth-api";
import { parsePostInput } from "../../../lib/post-input";
import { isSameOrigin } from "../../../lib/access";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res
      .setHeader("Allow", "POST")
      .status(405)
      .json({ error: "Method not allowed" });
  const session = await getSession(req);
  if (!session)
    return res.status(401).json({ error: "Sign in to post a track." });
  if (!isSameOrigin(req.headers.origin))
    return res.status(403).json({ error: "Invalid request origin." });
  let input: ReturnType<typeof parsePostInput>;
  try {
    input = parsePostInput(req.body);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const track = await tx.track.upsert({
        where: {
          source_sourceId: {
            source: input.track.source,
            sourceId: input.track.sourceId,
          },
        },
        create: input.track,
        update: {},
      });
      return tx.post.create({
        data: {
          content: input.content,
          authorId: session.user.id,
          trackId: track.id,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          authorId: true,
          trackId: true,
          author: { select: { username: true } },
        },
      });
    });
    const { author, ...post } = result;
    return res.status(201).json({
      ...post,
      profilePath: author?.username ? `/u/${encodeURIComponent(author.username)}` : "/feed",
    });
  } catch {
    return res
      .status(500)
      .json({ error: "Your track was not posted. Please try again." });
  }
}
export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };
