import { useState, useEffect } from "react";
import MemberAvatar from "../components/MemberAvatar";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";
import { authClient } from "../lib/auth-client";
import { isOwner } from "../lib/access";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
export default function Settings() {
  const {
    state: { user },
    setState,
  } = useAppContext();
  const [username, setUsername] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setUsername(user?.username || "");
  }, [user?.username]);
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
  return (
    <div className="settings-page">
      <h1>Make yourself at home.</h1>
      <p className="muted">Your profile. Your people. Your room.</p>
      <section className="settings-section">
        <h2>Your profile</h2>
        <div className="settings-identity">
          <MemberAvatar
            image={user?.image}
            name={user?.name || "You"}
            className="settings-avatar"
          />
          <div>
            <strong>{user?.name}</strong>
            <p className="muted">
              {user?.spotifyId ? "Photo from Spotify" : "Your profile photo"}
            </p>
          </div>
        </div>
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
        <section className="settings-section">
          <h2>Your people</h2>
          <Link href="/admin" className="button button-secondary">
            Open admin <ArrowUpRightIcon width={18} />
          </Link>
        </section>
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
