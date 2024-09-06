import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { options } from "../../api/auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, options);
  // @ts-ignore
  if (!session?.user?.id)
    return res.status(401).json({ error: "Unauthorized" });

  // @ts-ignore
  const userId = parseInt(session.user.id, 10);
  if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  res.status(200).json(user);
}
