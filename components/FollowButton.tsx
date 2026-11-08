import { useState } from "react";
import { CheckIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export default function FollowButton({
  username,
  initialFollowing,
  initialFollowers,
  followingCount,
  isSelf,
  followsYou,
}: {
  username: string;
  initialFollowing: boolean;
  initialFollowers: number;
  followingCount: number;
  isSelf: boolean;
  followsYou: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function toggle() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/follow/${encodeURIComponent(username)}`,
        {
          method: following ? "DELETE" : "POST",
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!response.ok)
        throw new Error("Your follow could not be updated. Please try again.");
      const data = await response.json();
      if (
        typeof data.following !== "boolean" ||
        !Number.isInteger(data.followerCount) ||
        data.followerCount < 0
      )
        throw new Error("Invalid follow response");
      setFollowing(data.following);
      setFollowers(data.followerCount);
    } catch {
      setError("Your follow could not be updated. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="profile-social">
      <div className="profile-social-counts" aria-live="polite">
        <span>
          {followers} {followers === 1 ? "follower" : "followers"}
        </span>
        <span>{followingCount} following</span>
        {!isSelf && followsYou && (
          <span className="mutual-note">Follows you</span>
        )}
      </div>
      {!isSelf && (
        <button
          className={`button ${following ? "button-secondary" : "button-primary"}`}
          type="button"
          aria-label={
            following
              ? `Following @${username}. Unfollow`
              : `Follow @${username}`
          }
          aria-pressed={following}
          aria-busy={pending}
          disabled={pending}
          onClick={toggle}
        >
          {following ? (
            <CheckIcon width={18} aria-hidden="true" />
          ) : (
            <UserPlusIcon width={18} aria-hidden="true" />
          )}
          {pending ? "Saving…" : following ? "Following" : "Follow"}
        </button>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
