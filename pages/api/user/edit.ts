import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getSession } from "../../../lib/auth-api";
import { isSameOrigin } from "../../../lib/access";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT")
    return res
      .setHeader("Allow", "PUT")
      .status(405)
      .json({ error: "Method not allowed" });
  const session = await getSession(req);
  if (!session)
    return res.status(401).json({ error: "Sign in to edit your profile." });
  if (!isSameOrigin(req.headers.origin))
    return res.status(403).json({ error: "Invalid request origin." });
  const username =
    typeof req.body?.username === "string"
      ? req.body.username.trim().toLowerCase()
      : "";
  if (!/^[a-z0-9_]{3,30}$/.test(username))
    return res
      .status(400)
      .json({ error: "Use 3–30 letters, numbers, or underscores." });
  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { username, displayUsername: username },
    });
    return res.json({ username: user.username });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002")
      return res.status(409).json({ error: "That username is already taken." });
    return res
      .status(500)
      .json({ error: "Your profile was not saved. Please try again." });
  }
}
