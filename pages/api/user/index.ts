import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getSession } from "../../../lib/auth-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req);
  if (!session?.user?.id)
    return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  res.status(200).json(user);
}
