import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { options } from "../../api/auth/[...nextauth]";
import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

import { SERVER_HOST } from "@util";

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const decoded = await getToken({ req, secret });
  const userId = decoded.sub;
  const url = `${SERVER_HOST}/user?id=${userId}`;
  console.log({ decoded });
  const token = jwt.sign(decoded, secret);
  console.log({ token });
  const body = {
    ...req.body,
    id: parseInt(userId),
  };
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
}
