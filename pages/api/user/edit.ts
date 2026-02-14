import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/auth-api";
import { SERVER_HOST } from "@util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;
  const url = `${SERVER_HOST}/user?id=${userId}`;
  const body = {
    ...req.body,
    id: userId,
  };

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
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
