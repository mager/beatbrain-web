import type { NextApiRequest, NextApiResponse } from "next";
import type { Invite } from "@prisma/client";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import {
  isOwner,
  isSameOrigin,
  PRIVATE_CACHE_CONTROL,
} from "../../../../lib/access";
import { hashInviteToken } from "../../../../lib/invites";
import {
  canonicalInviteURL,
  getMailjetSettings,
  sendMailjetInvite,
  validateInviteEmailContent,
} from "../../../../lib/mailjet";

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };
function deliveryState(
  invite: Pick<
    Invite,
    "id" | "emailStatus" | "emailSentAt" | "emailAttemptedAt" | "emailMessageId"
  >,
) {
  return {
    id: invite.id,
    emailStatus: invite.emailStatus,
    emailSentAt: invite.emailSentAt,
    emailAttemptedAt: invite.emailAttemptedAt,
    emailMessageId: invite.emailMessageId,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
      query: { disableCookieCache: true },
    });
    if (!session)
      return res.status(401).json({ error: "Sign in to continue." });
    if (!isOwner(session.user))
      return res
        .status(403)
        .json({ error: "Only the site owner can send invitations." });
    if (req.method === "POST" && !isSameOrigin(req.headers.origin))
      return res
        .status(403)
        .json({ error: "This request must come from Beatbrain." });
    const id = req.query.id;
    if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(id))
      return res.status(400).json({ error: "Invalid invitation." });
    const invite = await prisma.invite.findUnique({ where: { id } });
    if (!invite)
      return res.status(404).json({ error: "Invitation not found." });
    if (req.method === "GET")
      return res.status(200).json({ invite: deliveryState(invite) });
    const input = req.body;
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).some(
        (key) => !["token", "subject", "body"].includes(key),
      ) ||
      typeof input.token !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(input.token) ||
      hashInviteToken(input.token) !== invite.tokenHash
    )
      return res
        .status(400)
        .json({ error: "This invitation link is invalid." });
    // An accepted send is idempotent even if the invite was since used or expired.
    if (invite.emailStatus === "SENT")
      return res.status(200).json({ invite: deliveryState(invite) });
    if (invite.usedAt || invite.expiresAt <= new Date())
      return res
        .status(409)
        .json({
          error: "This invitation is used or expired.",
          invite: deliveryState(invite),
        });
    if (invite.emailStatus === "SENDING" || invite.emailStatus === "UNKNOWN")
      return res
        .status(409)
        .json({
          error:
            "Delivery is not confirmed. Check Mailjet before sending another invitation.",
          invite: deliveryState(invite),
        });
    const url = canonicalInviteURL(input.token, invite.email);
    if (!url || !getMailjetSettings().ready)
      return res
        .status(503)
        .json({
          error: "Email sending is not configured.",
          invite: deliveryState(invite),
        });
    const content = validateInviteEmailContent(input, url);
    if (!content)
      return res
        .status(400)
        .json({
          error:
            "Use a subject of 1–200 characters and a message of at most 12,000 characters. Keep the invitation link unchanged.",
        });
    const attemptedAt = new Date();
    // One atomic claim. SENDING is never released on a timeout or process crash.
    const claimed = await prisma.invite.updateMany({
      where: {
        id,
        tokenHash: invite.tokenHash,
        usedAt: null,
        expiresAt: { gt: attemptedAt },
        emailStatus: { in: ["UNSENT", "FAILED"] },
      },
      data: { emailStatus: "SENDING", emailAttemptedAt: attemptedAt },
    });
    if (claimed.count !== 1) {
      const current = await prisma.invite.findUnique({ where: { id } });
      return res
        .status(current?.emailStatus === "SENT" ? 200 : 409)
        .json({
          ...(current?.emailStatus === "SENT"
            ? {}
            : { error: "This invitation cannot be sent again." }),
          invite: current ? deliveryState(current) : null,
        });
    }
    const result = await sendMailjetInvite({
      inviteId: id,
      email: invite.email,
      ...content,
    });
    const status =
      result.status === "SENT"
        ? "SENT"
        : result.status === "FAILED" || result.status === "UNAVAILABLE"
          ? "FAILED"
          : "UNKNOWN";
    const finished = {
      ...invite,
      emailStatus: status,
      emailAttemptedAt: attemptedAt,
      emailSentAt: result.status === "SENT" ? new Date() : null,
      emailMessageId: result.status === "SENT" ? result.messageId : null,
    } as Invite;
    try {
      const saved = await prisma.invite.updateMany({
        where: { id, emailStatus: "SENDING", emailAttemptedAt: attemptedAt },
        data: {
          emailStatus: finished.emailStatus,
          emailSentAt: finished.emailSentAt,
          emailMessageId: finished.emailMessageId,
        },
      });
      if (saved.count !== 1) throw new Error("Delivery state was not stored");
    } catch {
      // Provider acceptance cannot be rolled back. Preserve the claim if the DB
      // is unavailable; either UNKNOWN or SENDING blocks automatic retries.
      try {
        await prisma.invite.updateMany({
          where: { id, emailStatus: "SENDING", emailAttemptedAt: attemptedAt },
          data: { emailStatus: "UNKNOWN" },
        });
      } catch {
        /* Keep SENDING. Never log provider data or the token. */
      }
      return res
        .status(503)
        .json({
          error:
            "Delivery could not be confirmed. Check Mailjet before sending another invitation.",
          invite: deliveryState({ ...finished, emailStatus: "UNKNOWN" }),
        });
    }
    return res
      .status(status === "SENT" ? 200 : 502)
      .json({
        ...(status === "SENT"
          ? {}
          : {
              error:
                status === "FAILED"
                  ? "Mailjet rejected the message. Check the sender settings, then try again."
                  : "Delivery is not confirmed. Check Mailjet before sending another invitation.",
            }),
        invite: deliveryState(finished),
      });
  } catch {
    return res
      .status(500)
      .json({
        error:
          "The email request could not be completed. Check its status before trying again.",
      });
  }
}
