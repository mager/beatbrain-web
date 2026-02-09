import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const hashed = await bcrypt.hash(password, 12);

  // Generate a username from the name or email prefix
  const baseName = (name || email.split("@")[0])
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);

  let username = baseName;
  let counter = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseName}${counter}`;
    counter++;
  }

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: name || null,
      username,
    },
  });

  res.status(201).json({ ok: true });
}
