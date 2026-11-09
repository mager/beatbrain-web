import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  ClipboardIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import Waitlist from "./Waitlist";
import {
  inviteEmail,
  inviteStatus,
  type EmailDraft,
} from "../lib/invite-email";

type Delivery = "UNSENT" | "SENDING" | "SENT" | "FAILED" | "UNKNOWN";
const deliveryLabels: Record<Delivery, string> = {
  UNSENT: "Not sent",
  SENDING: "Sending / check status",
  SENT: "Accepted by Mailjet",
  FAILED: "Not sent — retry available",
  UNKNOWN: "Unconfirmed — check Mailjet",
};
type MailSettings = {
  ready: boolean;
  fromEmail: string | null;
  fromName: string | null;
};
type Invite = {
  id: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  emailStatus: Delivery;
};
type Draft = EmailDraft & {
  id: string;
  url: string;
  expiresAt: string;
  emailStatus: Delivery;
};
export default function AdminInvites({ sender }: { sender: string }) {
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [mail, setMail] = useState<MailSettings>({
    ready: false,
    fromEmail: null,
    fromName: null,
  });
  const [sending, setSending] = useState(false);
  const [checkingMail, setCheckingMail] = useState(false);
  const [mailCheck, setMailCheck] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [sendError, setSendError] = useState("");
  const sendLock = useRef(false);
  const [copied, setCopied] = useState("");
  const [now, setNow] = useState(new Date());
  const draftSection = useRef<HTMLElement>(null);
  const locked = useRef(false);
  const load = useCallback(async () => {
    setLoading(true);
    setHistoryError("");
    try {
      const response = await fetch("/api/invites", {
        signal: AbortSignal.timeout(10000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error();
      setInvites(data.invites);
      setMail(data.mail || { ready: false, fromEmail: null, fromName: null });
    } catch {
      setHistoryError("Invites could not be loaded. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, [load]);
  useEffect(() => {
    if (draft) draftSection.current?.focus();
  }, [draft?.url]);
  async function createInvite(recipient: string): Promise<boolean> {
    if (locked.current) return false;
    if (draft) {
      setError(
        "Copy or discard your current draft before you prepare another.",
      );
      draftSection.current?.focus();
      return false;
    }
    locked.current = true;
    setBusy(true);
    setError("");
    setCopied("");
    setSendError("");
    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recipient }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "The invite could not be created. Try again.",
        );
      setEmail(data.invite.email);
      setDraft({
        ...inviteEmail({
          email: data.invite.email,
          url: data.url,
          expiresAt: data.invite.expiresAt,
          sender,
        }),
        id: data.invite.id,
        emailStatus: data.invite.emailStatus || "UNSENT",
        url: data.url,
        expiresAt: data.invite.expiresAt,
      });
      setInvites((current) => [data.invite, ...current].slice(0, 50));
      setNow(new Date());
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error && cause.name === "Error"
          ? cause.message
          : "The invite could not be created. Try again.",
      );
      return false;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  async function checkMail() {
    setCheckingMail(true);
    setMailCheck(null);
    try {
      const response = await fetch("/api/admin/mail-check", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      setMailCheck({
        ok: response.ok && result.ok,
        message:
          result.message ||
          result.error ||
          "The email setup check failed. Try again.",
      });
    } catch {
      setMailCheck({
        ok: false,
        message: "The email setup check could not finish. Try again.",
      });
    } finally {
      setCheckingMail(false);
    }
  }
  function recordDelivery(state: { id: string; emailStatus: Delivery }) {
    setDraft((current) =>
      current?.id === state.id
        ? { ...current, emailStatus: state.emailStatus }
        : current,
    );
    setInvites((current) =>
      current.map((invite) =>
        invite.id === state.id
          ? { ...invite, emailStatus: state.emailStatus }
          : invite,
      ),
    );
  }
  async function deliver(checkOnly = false) {
    if (!draft || sendLock.current) return;
    sendLock.current = true;
    setSending(true);
    setSendError("");
    const id = draft.id;
    try {
      const response = await fetch(
        `/api/invites/${id}/send`,
        checkOnly
          ? { signal: AbortSignal.timeout(15000) }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: AbortSignal.timeout(15000),
              body: JSON.stringify({
                token: new URL(draft.url).searchParams.get("invite"),
                subject: draft.subject,
                body: draft.body,
              }),
            },
      );
      const result = await response.json();
      if (result.invite) recordDelivery(result.invite);
      else if (!checkOnly && response.status >= 500)
        recordDelivery({ id, emailStatus: "UNKNOWN" });
      if (!response.ok)
        throw new Error(
          result.error ||
            "The email status could not be confirmed. Check Mailjet before trying again.",
        );
    } catch (cause) {
      if (!(cause instanceof Error && cause.name === "Error")) {
        recordDelivery({ id, emailStatus: "UNKNOWN" });
        setSendError(
          "The email status could not be confirmed. Check its status before trying again.",
        );
      } else setSendError(cause.message);
    } finally {
      sendLock.current = false;
      setSending(false);
    }
  }
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setError("");
    } catch {
      setError("Copy failed. Select the text and copy it instead.");
    }
  }
  const expired = draft && new Date(draft.expiresAt) <= now;
  const sent = draft?.emailStatus === "SENT";
  const uncertain = draft && ["SENDING", "UNKNOWN"].includes(draft.emailStatus);
  return (
    <>
      <section className="admin-mail-setup" aria-label="Email setup">
        <div>
          <h2>Email setup</h2>
          <p className="muted">
            {loading
              ? "Checking settings…"
              : mail.ready
                ? `${mail.fromName} <${mail.fromEmail}>`
                : "Add the Mailjet settings in Vercel, then redeploy."}
          </p>
        </div>
        <button
          type="button"
          className="button button-secondary"
          disabled={!mail.ready || checkingMail}
          aria-busy={checkingMail}
          onClick={() => void checkMail()}
        >
          {checkingMail ? "Checking…" : "Test email setup"}
        </button>
        {mailCheck && (
          <p
            className={mailCheck.ok ? "success-message" : "form-error"}
            role={mailCheck.ok ? "status" : "alert"}
          >
            {mailCheck.message}
          </p>
        )}
      </section>
      <div className="admin-columns">
        <div>
          <section className="settings-section">
            <h2>Invite a friend</h2>
            <p className="muted">One email. One use. Seven days.</p>
            <form
              className="form-stack"
              onSubmit={(event) => {
                event.preventDefault();
                void createInvite(email);
              }}
            >
              <label>
                Their email
                <input
                  type="email"
                  autoComplete="off"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <button
                className="button button-primary"
                disabled={busy || Boolean(draft)}
                aria-busy={busy}
              >
                {busy ? "Creating…" : "Prepare invite email"}
                <EnvelopeIcon width={18} aria-hidden="true" />
              </button>
              <p className="field-hint">
                {draft
                  ? "Copy or discard your current draft before creating another."
                  : "Creates a new private link. No email is sent."}
              </p>
            </form>
          </section>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {draft && (
            <section
              className="settings-section invite-email-draft"
              ref={draftSection}
              tabIndex={-1}
              aria-labelledby="invite-draft-title"
            >
              <h2 id="invite-draft-title">
                {sent ? "Invite sent" : "Review your email"}
              </h2>
              <p className="muted">
                {mail.ready
                  ? `From ${mail.fromName} <${mail.fromEmail}>`
                  : "Mailjet is not ready. Add the sender settings in Vercel, then redeploy."}
              </p>
              <div className="form-stack">
                <label>
                  To
                  <input readOnly value={draft.email} />
                </label>
                <label>
                  Subject
                  <input
                    maxLength={200}
                    readOnly={sending || sent || Boolean(uncertain)}
                    value={draft.subject}
                    onChange={(event) => {
                      setDraft({ ...draft, subject: event.target.value });
                      setCopied("");
                    }}
                  />
                </label>
                <label>
                  Message
                  <textarea
                    rows={15}
                    maxLength={12000}
                    readOnly={sending || sent || Boolean(uncertain)}
                    value={draft.body}
                    onChange={(event) => {
                      setDraft({ ...draft, body: event.target.value });
                      setCopied("");
                    }}
                  />
                </label>
                <label>
                  Invite link
                  <input
                    readOnly
                    value={draft.url}
                    onFocus={(event) => event.target.select()}
                  />
                </label>
                {expired ? (
                  <p className="form-error" role="alert">
                    This invite has expired. Prepare a new one.
                  </p>
                ) : (
                  <div className="admin-draft-actions">
                    {uncertain ? (
                      <button
                        type="button"
                        className="button button-secondary"
                        disabled={sending}
                        onClick={() => void deliver(true)}
                      >
                        {sending ? "Checking…" : "Check email status"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button button-primary"
                        disabled={
                          sending ||
                          sent ||
                          !mail.ready ||
                          !draft.subject.trim() ||
                          !draft.body.trim()
                        }
                        aria-busy={sending}
                        onClick={() => void deliver()}
                      >
                        <EnvelopeIcon width={18} aria-hidden="true" />{" "}
                        {sending
                          ? "Sending…"
                          : sent
                            ? "Email sent"
                            : "Send invite"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() =>
                        void copy(
                          `To: ${draft.email}\nSubject: ${draft.subject}\n\n${draft.body}`,
                          "Email copied",
                        )
                      }
                    >
                      {copied === "Email copied" ? (
                        <CheckIcon width={18} />
                      ) : (
                        <ClipboardIcon width={18} />
                      )}{" "}
                      Copy email
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => void copy(draft.url, "Link copied")}
                    >
                      Copy link
                    </button>
                  </div>
                )}
                {sendError && (
                  <p className="form-error" role="alert">
                    {sendError}
                  </p>
                )}
                {sent ? (
                  <p className="success-message" role="status">
                    Mailjet accepted this email. This does not confirm inbox
                    delivery.
                  </p>
                ) : (
                  <p className="field-hint">
                    {uncertain
                      ? "Delivery is unconfirmed. Check Mailjet before creating another invite."
                      : "Review the recipient and message, then send. Keep the invite link in the message. Draft text is not saved here."}
                  </p>
                )}
                <button
                  type="button"
                  className="text-button admin-discard"
                  disabled={sending}
                  onClick={() => {
                    setDraft(null);
                    setCopied("");
                    setError("");
                    setSendError("");
                  }}
                >
                  {sent ? "Prepare another invite" : "Discard draft"}
                </button>
                {copied && (
                  <p role="status" className="success-message">
                    {copied}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
        <div>
          <section className="settings-section">
            <h2>Recent invites</h2>
            {historyError ? (
              <div role="alert">
                <p className="form-error">{historyError}</p>
                <button className="text-button" onClick={() => void load()}>
                  Reload invites
                </button>
              </div>
            ) : loading ? (
              <p className="muted" role="status">
                Loading invites…
              </p>
            ) : invites.length ? (
              <ul className="admin-invite-list">
                {invites.map((invite) => (
                  <li key={invite.id}>
                    <div>
                      <strong>{invite.email}</strong>
                      <span>
                        {deliveryLabels[invite.emailStatus || "UNSENT"]}
                      </span>
                      <span>
                        {inviteStatus(invite, now) === "Used"
                          ? "Used"
                          : "Expires"}{" "}
                        {new Date(
                          invite.usedAt || invite.expiresAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </span>
                    </div>
                    <span
                      className={`invite-status invite-status-${inviteStatus(invite, now).toLowerCase()}`}
                    >
                      {inviteStatus(invite, now)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Your first invite starts here.</p>
            )}
            <p className="field-hint admin-history-note">
              The latest 50 invites. Links are shown only when created. Pending
              means the invite has not been used.
            </p>
          </section>
          <Waitlist onInvite={createInvite} busy={busy || Boolean(draft)} />
        </div>
      </div>
    </>
  );
}
