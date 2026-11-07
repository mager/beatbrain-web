import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { LockClosedIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { authClient } from "../../lib/auth-client";
import SpotifyLogo from "../../components/SpotifyLogo";
import FooterCredit from "../../components/FooterCredit";
import { safeReturnPath } from "../../lib/access";

export default function SignIn() {
  const router = useRouter();
  const invite =
    typeof router.query.invite === "string" ? router.query.invite : "";
  const waitlisted = router.query.error === "WAITLIST_JOINED";
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [username, setUsername] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    if (typeof router.query.email === "string") setEmail(router.query.email);
    if (typeof router.query.error === "string" && router.query.error !== "WAITLIST_JOINED")
      setError(
        "Spotify could not sign you in. Please try again, or use your email and password.",
      );
  }, [router.query.email, router.query.error]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = invite
        ? await authClient.signUp.email(
            { email, password, name, username },
            { headers: { "x-invite-token": invite } },
          )
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(
          result.error.message || "Could not sign in. Please try again.",
        );
        return;
      }
      window.location.assign(safeReturnPath(router.query.callbackUrl));
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  async function spotify() {
    setLoading(true);
    setError("");
    try {
      const result = await authClient.signIn.social({
        provider: "spotify",
        callbackURL: "/",
        errorCallbackURL: "/auth/signin",
      });
      if (result.error) {
        setError(result.error.message || "Could not connect to Spotify.");
        setLoading(false);
      }
    } catch {
      setError("Could not connect to Spotify. Please try again.");
      setLoading(false);
    }
  }
  return (
    <div className="entry-page">
      <div className="entry-brand wordmark">
        beatbrain
        <span className="brand-signal" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <section className="entry-copy">
        <div className="record-object" aria-hidden="true">
          <div className="record-label">
            <span>bb</span>
          </div>
        </div>
        <h1>
          Your music.
          <br />
          <span>Your people.</span>
        </h1>
        <p>Good music. Close friends. Your kind of place.</p>
        <span className="private-note">
          <LockClosedIcon width={14} /> Invite only.
        </span>
      </section>
      <section className="entry-form">
        {waitlisted ? (
          <div className="waitlist-confirmation" role="status">
            <h2>You’re on the waitlist.</h2>
            <p className="muted">Your place is saved. You’ll need an invite to enter.</p>
            <Link href="/auth/signin" className="button button-secondary">Back to sign in</Link>
          </div>
        ) : (
        <>
        <h2>{invite ? "You’re on the list." : "Come on in."}</h2>
        <p className="muted">
          {invite
            ? "Make an account and join the listening room."
            : "Your next favorite is waiting."}
        </p>
        <form onSubmit={submit} className="form-stack">
          {invite && (
            <>
              <label>
                Your name
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                />
              </label>
              <label>
                Username
                <input
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  pattern="[a-z0-9_]{3,30}"
                  title="3–30 letters, numbers, or underscores"
                  required
                />
                <span className="field-hint">
                  Your feed will live at /u/{username || "you"}
                </span>
              </label>
            </>
          )}
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={invite ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            {invite && (
              <span className="field-hint">At least 8 characters.</span>
            )}
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button className="button button-primary" disabled={loading}>
            {loading
              ? "Opening the door…"
              : invite
                ? "Join the room"
                : "Sign in"}
            <ArrowUpRightIcon width={18} />
          </button>
        </form>
        {!invite && (
          <>
            <div className="form-divider">or</div>
            <button
              onClick={spotify}
              disabled={loading}
              className="button button-secondary full-width"
            >
              <SpotifyLogo /> Continue with Spotify
            </button>
            <p className="entry-footnote">
              Members sign in. New listeners join the waitlist.
            </p>
          </>
        )}
        </>
        )}
      </section>
      <footer className="entry-footer">
        <FooterCredit />
      </footer>
    </div>
  );
}
