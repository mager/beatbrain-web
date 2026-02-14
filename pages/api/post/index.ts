import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getSession } from "../../../lib/auth-api";

// POST /api/post
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { content, track } = req.body;
  const session = await getSession(req);

  if (!session) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  // Check if a track exists
  let trackToUpdate = await prisma.track.findUnique({
    where: {
      source_sourceId: {
        source: "SPOTIFY",
        sourceId: track.sourceId,
      },
    },
  });

  if (!trackToUpdate) {
    trackToUpdate = await prisma.track.create({
      data: track,
    });
  }

  const result = await prisma.post.create({
    data: {
      content,
      author: { connect: { email: session.user.email } },
      track: { connect: { id: trackToUpdate.id } },
    },
  });
  res.json(result);
}
