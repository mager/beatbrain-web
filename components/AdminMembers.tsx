import { useEffect, useState } from "react";
import Link from "next/link";
import MemberAvatar from "./MemberAvatar";
import { isOwner } from "../lib/access";
type Member = {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  email: string;
  createdAt: string;
  _count: { posts: number };
};
export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  async function load(after?: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/members${after ? `?cursor=${encodeURIComponent(after)}` : ""}`,
        { signal: AbortSignal.timeout(10000) },
      );
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      setMembers((current) =>
        after ? [...current, ...data.members] : data.members,
      );
      setCursor(data.nextCursor);
    } catch {
      setError("Members could not be loaded. Try again.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <section
      className="settings-section admin-members"
      aria-labelledby="members-title"
    >
      <h2 id="members-title">Members</h2>
      <ul className="admin-member-list">
        {members.map((member) => (
          <li key={member.id}>
            <MemberAvatar image={member.image} name={member.name} />
            <div className="admin-member-identity">
              {member.username ? (
                <Link href={`/u/${member.username}`}>
                  {member.name} <span>@{member.username}</span>
                </Link>
              ) : (
                <strong>{member.name}</strong>
              )}
              <span>{member.email}</span>
            </div>
            <div className="admin-member-facts">
              <span>
                {isOwner(member) ? "Owner" : "Member"} · {member._count.posts}{" "}
                {member._count.posts === 1 ? "post" : "posts"}
              </span>
              <span>
                Joined{" "}
                {new Date(member.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {busy && (
        <p className="muted" role="status">
          Loading members…
        </p>
      )}
      {!busy && !error && !members.length && (
        <p className="muted">No members found.</p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {(cursor || error) && (
        <button
          className="text-button"
          disabled={busy}
          onClick={() => void load(cursor || undefined)}
        >
          {error ? "Try again" : "Load more members"}
        </button>
      )}
    </section>
  );
}
