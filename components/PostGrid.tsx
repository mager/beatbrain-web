import Link from "next/link";
import AlbumArtwork from "./AlbumArtwork";
import { ArrowUpRightIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
export type FeedPost = {
  id: number;
  content: string | null;
  createdAt: string;
  author: {
    name: string;
    username: string | null;
    image: string | null;
  } | null;
  track: { title: string; artist: string; sourceId: string; image: string };
};
export default function PostGrid({ posts }: { posts: FeedPost[] }) {
  if (!posts.length)
    return (
      <div className="empty-state">
        <MusicalNoteIcon width={40} />
        <h2>A room waiting for its first track.</h2>
        <p>Post what you’re listening to. It starts with one song.</p>
        <Link href="/create" className="button button-primary">
          Post a track
        </Link>
      </div>
    );
  return (
    <div className="post-grid">
      {posts.map((post) => (
        <article className="music-post" key={post.id}>
          <div className="post-byline">
            <Link
              href={post.author?.username ? `/u/${post.author.username}` : "/"}
              className="post-person"
            >
              <span className="avatar">
                {post.author?.image ? (
                  <img src={post.author.image} alt="" width={28} height={28} />
                ) : (
                  post.author?.name?.[0] || "b"
                )}
              </span>
              <span>
                {post.author?.username || post.author?.name || "Member"}
              </span>
            </Link>
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
          </div>
          <AlbumArtwork
            src={post.track.image}
            title={`${post.track.title} by ${post.track.artist}`}
            href={`/ext/spotify/${post.track.sourceId}`}
          />

          <div className="post-track">
            <div>
              <h2>
                <Link href={`/ext/spotify/${post.track.sourceId}`}>
                  {post.track.title}
                </Link>
              </h2>
              <p>{post.track.artist}</p>
            </div>
            <a
              href={`https://open.spotify.com/track/${post.track.sourceId}`}
              target="_blank"
              rel="noreferrer"
              className="listen-link"
              aria-label={`Listen to ${post.track.title} on Spotify`}
            >
              <ArrowUpRightIcon width={20} />
            </a>
          </div>
          {post.content && <p className="post-note">{post.content}</p>}
        </article>
      ))}
    </div>
  );
}
