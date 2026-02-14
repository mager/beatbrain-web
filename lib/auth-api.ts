import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import type { NextApiRequest } from "next";

/**
 * Get the Better Auth session from a Pages Router API request.
 * Returns { session, user } or null.
 */
export async function getSession(req: NextApiRequest) {
  return auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
}
