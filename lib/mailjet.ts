/** Server-only Mailjet Send API v3.1. Never import this module into client code.
 * https://dev.mailjet.com/docs/email-api/send-api-v31/send-basic-email
 * SandboxMode validates without delivery; TrackOpens/TrackClicks disable tracking.
 */
type MailjetConfig = {
  key: string;
  secret: string;
  fromEmail: string;
  fromName: string;
};
export type MailjetResult =
  | { status: "SENT"; messageId: string }
  | { status: "FAILED" | "UNKNOWN" | "UNAVAILABLE" | "VALIDATED" };
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function readConfig(): MailjetConfig | null {
  const key = process.env.MAILJET_API_KEY?.trim();
  const secret = process.env.MAILJET_API_SECRET?.trim();
  const fromEmail = process.env.MAILJET_FROM_EMAIL?.trim();
  const fromName = process.env.MAILJET_FROM_NAME?.trim() || "Beatbrain";
  if (
    !key ||
    !secret ||
    /[\s:]/.test(key + secret) ||
    key.length > 200 ||
    secret.length > 200 ||
    !fromEmail ||
    fromEmail.length > 254 ||
    !emailPattern.test(fromEmail) ||
    fromName.length > 200 ||
    /[\x00-\x1f\x7f]/.test(fromName) ||
    !configuredAppURL()
  )
    return null;
  return { key, secret, fromEmail, fromName };
}

function configuredAppURL(): URL | null {
  try {
    const value = process.env.BETTER_AUTH_URL;
    if (!value) return null;
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    return url;
  } catch {
    return null;
  }
}

export function getMailjetSettings() {
  const config = readConfig();
  return {
    ready: Boolean(config),
    fromEmail: config?.fromEmail ?? null,
    fromName: config?.fromName ?? null,
  };
}

export function canonicalInviteURL(
  token: string,
  email: string,
): string | null {
  const base = configuredAppURL();
  if (!base) return null;
  const url = new URL("/auth/signin", base);
  url.searchParams.set("invite", token);
  url.searchParams.set("email", email);
  return url.toString();
}

export function validateInviteEmailContent(
  value: unknown,
  inviteURL: string,
): { subject: string; body: string } | null {
  if (!value || typeof value !== "object") return null;
  const { subject, body } = value as Record<string, unknown>;
  if (
    typeof subject !== "string" ||
    !subject.trim() ||
    subject.length > 200 ||
    /[\x00-\x1f\x7f]/.test(subject) ||
    typeof body !== "string" ||
    body.length > 12000 ||
    /[\x00]/.test(body) ||
    !body.split(/\s+/).includes(inviteURL)
  )
    return null;
  return { subject: subject.trim(), body };
}

export async function sendMailjetInvite(
  input: { inviteId: string; email: string; subject: string; body: string },
  options: { sandbox?: boolean; fetch?: typeof fetch } = {},
): Promise<MailjetResult> {
  const config = readConfig();
  if (!config) return { status: "UNAVAILABLE" };
  if (
    !emailPattern.test(input.email) ||
    input.email.length > 254 ||
    !/^[A-Za-z0-9_-]{1,128}$/.test(input.inviteId) ||
    !input.subject.trim() ||
    input.subject.length > 200 ||
    /[\x00-\x1f\x7f]/.test(input.subject) ||
    !input.body ||
    input.body.length > 12000
  )
    return { status: "FAILED" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await (options.fetch || fetch)(
      "https://api.mailjet.com/v3.1/send",
      {
        method: "POST",
        redirect: "error",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(`${config.key}:${config.secret}`).toString("base64"),
        },
        body: JSON.stringify({
          SandboxMode: options.sandbox === true,
          Messages: [
            {
              From: { Email: config.fromEmail, Name: config.fromName },
              To: [{ Email: input.email }],
              Subject: input.subject,
              TextPart: input.body,
              TrackOpens: "disabled",
              TrackClicks: "disabled",
              CustomID: `beatbrain-invite-${input.inviteId}`,
            },
          ],
        }),
      },
    );
    if (
      response.status >= 400 &&
      response.status < 500 &&
      response.status !== 408
    )
      return { status: "FAILED" };
    if (!response.ok) return { status: "UNKNOWN" };
    const data = await response.json();
    if (!Array.isArray(data?.Messages) || data.Messages.length !== 1)
      return { status: "UNKNOWN" };
    const message = data.Messages[0];
    if (
      message?.Status === "error" &&
      Array.isArray(message.Errors) &&
      message.Errors.length > 0 &&
      message.Errors.every(
        (error: any) =>
          Number.isInteger(error?.StatusCode) &&
          error.StatusCode >= 400 &&
          error.StatusCode < 500 &&
          error.StatusCode !== 408,
      )
    )
      return { status: "FAILED" };
    if (
      message?.Status !== "success" ||
      (Array.isArray(message.Errors) && message.Errors.length > 0) ||
      !Array.isArray(message.To) ||
      message.To.length !== 1 ||
      message.To[0]?.Email?.toLowerCase() !== input.email.toLowerCase()
    )
      return { status: "UNKNOWN" };
    if (options.sandbox === true) return { status: "VALIDATED" };
    const recipient = message.To[0];
    const id =
      typeof recipient.MessageUUID === "string" &&
      /^[A-Za-z0-9-]{1,128}$/.test(recipient.MessageUUID)
        ? recipient.MessageUUID
        : Number.isSafeInteger(recipient.MessageID) && recipient.MessageID > 0
          ? String(recipient.MessageID)
          : null;
    return id ? { status: "SENT", messageId: id } : { status: "UNKNOWN" };
  } catch {
    return { status: "UNKNOWN" };
  } finally {
    clearTimeout(timer);
  }
}
