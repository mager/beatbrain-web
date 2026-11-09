import type { NextApiRequest, NextApiResponse } from "next";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../../lib/auth";
import {
  isOwner,
  isSameOrigin,
  PRIVATE_CACHE_CONTROL,
} from "../../../lib/access";
import { getMailjetSettings, sendMailjetInvite } from "../../../lib/mailjet";

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

/** Validate the deployed credentials and sender. This route can never send mail. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
      query: { disableCookieCache: true },
    });
    if (!session)
      return res.status(401).json({ ok: false, error: "Sign in to continue." });
    if (!isOwner(session.user))
      return res
        .status(403)
        .json({
          ok: false,
          error: "Only the site owner can check email settings.",
        });
    if (!isSameOrigin(req.headers.origin))
      return res
        .status(403)
        .json({ ok: false, error: "This request must come from Beatbrain." });
    const settings = getMailjetSettings();
    if (!settings.ready || !settings.fromEmail)
      return res
        .status(503)
        .json({
          ok: false,
          error:
            "Email sending is not configured. Check the sender settings in Vercel.",
        });
    // All content and the recipient are fixed on the server. The helper bounds
    // its request to 10 seconds, and Mailjet SandboxMode prevents delivery.
    const result = await sendMailjetInvite(
      {
        inviteId: "setup-check",
        email: settings.fromEmail,
        subject: "Beatbrain email setup check",
        body: "This request validates the Beatbrain sender settings. No email is sent.",
      },
      { sandbox: true },
    );
    if (result.status === "VALIDATED")
      return res
        .status(200)
        .json({
          ok: true,
          message: "Mailjet accepted the sender settings. No email was sent.",
        });
    if (result.status === "UNAVAILABLE")
      return res
        .status(503)
        .json({
          ok: false,
          error:
            "Email sending is not configured. Check the sender settings in Vercel.",
        });
    return res
      .status(502)
      .json({
        ok: false,
        error:
          result.status === "FAILED"
            ? "Mailjet rejected the setup check. Check the API keys and verify the sender domain in Mailjet. No email was sent."
            : "The setup check could not be confirmed. Check the sender settings in Mailjet and try again. No email was sent.",
      });
  } catch {
    return res
      .status(500)
      .json({
        ok: false,
        error:
          "The email setup check could not be completed. No email was sent.",
      });
  }
}
