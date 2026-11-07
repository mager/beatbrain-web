import { useCallback, useEffect, useState } from "react";

type Entry = { id: string; name: string; email: string; invitedAt: string | null };
export default function Waitlist({ onInvite, busy }: {
  onInvite: (email: string) => Promise<boolean>;
  busy: boolean;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const load = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/waitlist${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`, { signal: AbortSignal.timeout(10000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The waitlist could not be loaded.");
      setEntries(previous => cursor ? [...previous, ...data.entries] : data.entries);
      setNextCursor(data.nextCursor);
    } catch {
      setError("The waitlist could not be loaded. Try again.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return (
    <section className="settings-section">
      <h2>Waitlist</h2>
      {error ? (
        <div role="alert">
          <p className="form-error">{error}</p>
          <button className="text-button" onClick={() => void load()}>Try again</button>
        </div>
      ) : loading && !entries.length ? <p className="muted" role="status">Loading the waitlist…</p> : entries.length ? (
        <>
        <ul className="waitlist-entries">
          {entries.map(entry => (
            <li key={entry.id}>
              <div>
                {entry.name && <strong>{entry.name}</strong>}
                <span>{entry.email}</span>
                {entry.invitedAt && <small>Invite created</small>}
              </div>
              <button className="button button-secondary" disabled={busy} onClick={async () => {
                if (await onInvite(entry.email)) await load();
              }}>{entry.invitedAt ? "New link" : "Create invite"}</button>
            </li>
          ))}
        </ul>
        {nextCursor && <button className="text-button" disabled={loading || busy} onClick={() => void load(nextCursor)}>{loading ? "Loading…" : "Load more"}</button>}
        </>
      ) : <p className="muted">No one is waiting yet.</p>}
    </section>
  );
}
