import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { content, track } = req.body;
  const token = await getToken({ req, secret });
  const session = await getServerSession(req, res, options);
  if (session) {
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
        author: { connect: { email: session?.user?.email } },
        track: { connect: { id: trackToUpdate.id } },
      },
    });
    res.json(result);
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
}
