import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";
import { authClient } from "../lib/auth-client";
import { isOwner } from "../lib/access";
import Waitlist from "../components/Waitlist";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
export default function Settings() {
  const {
    state: { user },
    setState,
  } = useAppContext();
  const [username, setUsername] = useState(""),
    [email, setEmail] = useState(""),
    [inviteURL, setInviteURL] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [copied, setCopied] = useState(false);
  useEffect(() => {
    setUsername(user?.username || "");
  }, [user?.username]);
  useEffect(() => {
    if (inviteURL) document.querySelector(".invite-result")?.scrollIntoView({ block: "nearest" });
  }, [inviteURL]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/user/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setState((s) => ({ ...s, user: { ...s.user, username: data.username } }));
      setMessage("Your profile is saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function invite(event: React.FormEvent) {
    event.preventDefault();
    await createInvite(email);
  }
  async function createInvite(recipient: string): Promise<boolean> {
    setBusy(true);
    setEmail(recipient);
    setError("");
    setInviteURL("");
    setCopied(false);
    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recipient }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setInviteURL(data.url);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="settings-page">
      <h1>Make yourself at home.</h1>
      <p className="muted">Your profile. Your people. Your room.</p>
      <section className="settings-section">
        <h2>Your profile</h2>
        <form className="form-stack" onSubmit={save}>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              required
              pattern="[a-z0-9_]{3,30}"
              maxLength={30}
            />
            <span className="field-hint">
              3–30 letters, numbers, or underscores.
            </span>
          </label>
          <div className="inline-actions">
            <button className="button button-secondary" disabled={busy}>
              Save profile
            </button>
            {user?.username && (
              <Link href={`/u/${user.username}`}>
                View my feed <ArrowUpRightIcon width={14} />
              </Link>
            )}
          </div>
        </form>
      </section>
      {isOwner(user) && (
        <>
        <section className="settings-section">
          <h2>Bring your people.</h2>
          <p className="muted">
            Make a private invite for a friend. Each link works once, for their
            email, and expires in 7 days.
          </p>
          <form onSubmit={invite} className="form-stack">
            <label>
              Their email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button className="button button-primary" disabled={busy}>
              Create invite <ArrowUpRightIcon width={18} />
            </button>
          </form>
          {inviteURL && (
            <div className="invite-result">
              <label>
                Invite link
                <input
                  readOnly
                  value={inviteURL}
                  onFocus={(e) => e.target.select()}
                />
              </label>
              <button
                className="button button-secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(inviteURL);
                    setCopied(true);
                  } catch {
                    setError("Select and copy the link above.");
                  }
                }}
              >
                {copied ? (
                  <CheckIcon width={18} />
                ) : (
                  <ClipboardIcon width={18} />
                )}{" "}
                {copied ? "Copied" : "Copy link"}
              </button>
              <p className="field-hint">
                Send this link to your friend. No email has been sent.
              </p>
            </div>
          )}
        </section>
        <Waitlist onInvite={createInvite} busy={busy} />
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="success-message">
          {message}
        </p>
      )}
      <section className="settings-section">
        <button
          className="text-button"
          onClick={() =>
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => window.location.assign("/auth/signin"),
              },
            })
          }
        >
          Sign out
        </button>
      </section>
    </div>
  );
}
