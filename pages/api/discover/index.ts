import { backendFetch } from "../../../lib/backend";
import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_HOST } from "@util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const backendRes = await backendFetch(`${SERVER_HOST}/discover/v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: "{}",
      signal: AbortSignal.timeout(8000),
    });
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (error) {
    const timeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    res
      .status(timeout ? 504 : 502)
      .json({ error: "Discovery is unavailable. Please try again." });
  }
}
