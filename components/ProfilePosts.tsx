import { useEffect, useState } from "react";
import Link from "next/link";
import LoveButton, { type LoveState } from "./LoveButton";
import {
  Bars3Icon,
  MusicalNoteIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import PostGrid, { type FeedPost } from "./PostGrid";

type View = "grid" | "feed";
const VIEW_KEY = "beatbrain.profile-view";

function ProfileCover({
  post,
  onLoveChange,
}: {
  post: FeedPost;
  onLoveChange: (id: number, state: LoveState) => void;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <article className="profile-post">
      <Link
        href={`/ext/spotify/${post.track.sourceId}`}
        className="profile-record"
        aria-label={`${post.track.title} by ${post.track.artist}`}
        title={`${post.track.title} — ${post.track.artist}`}
      >
        <span className="profile-record-art">
          {post.track.image && !failed ? (
            <img
              src={post.track.image}
              alt=""
              width={200}
              height={200}
              loading="lazy"
              onError={() => setFailed(true)}
            />
          ) : (
            <MusicalNoteIcon width={32} aria-hidden="true" />
          )}
        </span>
        <span className="profile-record-title">{post.track.title}</span>
        <span className="profile-record-artist">{post.track.artist}</span>
      </Link>
      <LoveButton
        postId={post.id}
        title={post.track.title}
        lovedByViewer={post.lovedByViewer}
        loveCount={post.loveCount}
        onChange={onLoveChange}
      />
    </article>
  );
}

export default function ProfilePosts({
  posts: initialPosts,
}: {
  posts: FeedPost[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  useEffect(() => setPosts(initialPosts), [initialPosts]);
  function onLoveChange(id: number, state: LoveState) {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? { ...post, lovedByViewer: state.loved, loveCount: state.loveCount }
          : post,
      ),
    );
  }
  const [view, setView] = useState<View>("grid");
  useEffect(() => {
    try {
      if (localStorage.getItem(VIEW_KEY) === "feed") setView("feed");
    } catch {
      /* The switch also works when browser storage is unavailable. */
    }
  }, []);
  function selectView(next: View) {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* Keep the current choice in memory. */
    }
  }
  if (!posts.length) return <PostGrid posts={posts} />;
  return (
    <>
      <div className="profile-view-toolbar">
        <div
          className="profile-view-switch"
          role="group"
          aria-label="Profile view"
        >
          <button
            type="button"
            aria-pressed={view === "grid"}
            onClick={() => selectView("grid")}
          >
            <Squares2X2Icon width={18} aria-hidden="true" /> Grid
          </button>
          <button
            type="button"
            aria-pressed={view === "feed"}
            onClick={() => selectView("feed")}
          >
            <Bars3Icon width={18} aria-hidden="true" /> Feed
          </button>
        </div>
      </div>
      {view === "grid" ? (
        <div className="profile-record-grid">
          {posts.map((post) => (
            <ProfileCover
              key={post.id}
              post={post}
              onLoveChange={onLoveChange}
            />
          ))}
        </div>
      ) : (
        <PostGrid posts={posts} layout="list" onLoveChange={onLoveChange} />
      )}
    </>
  );
}
