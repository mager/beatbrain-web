import React from "react";
import Link from "next/link";
import Image from "next/image";

export type TrackProps = {
  id?: number;
  title?: string;
  artist?: string;
  image?: string;
  source?: string;
  sourceId?: string;
};

export type AuthorProps = {
  name?: string;
  email?: string;
  image?: string;
  username?: string;
};

export type PostProps = {
  id: number;
  title?: string;
  createdAt: Date | string;
  author: AuthorProps | null;
  track: TrackProps | null;
  content: string;
};

type Props = {
  post: PostProps;
};

const FeedPost: React.FC<Props> = ({ post }) => {
  const authorName = post.author?.name || "Anonymous";
  const authorUsername = post.author?.username;
  
  const timeAgo = (() => {
    const date = new Date(post.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  })();

  return (
    <article className="group relative">
      <Link 
        href={`/ext/spotify/${post.track?.sourceId || ""}`}
        className="block border border-terminal-border hover:border-terminal-border-bright bg-terminal-surface rounded p-4 transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 font-mono text-[10px]">
          <span className="text-cool">
            {authorUsername ? `@${authorUsername}` : authorName}
          </span>
          <span className="text-phosphor-dim">saved</span>
          <span className="text-accent ml-auto">{timeAgo}</span>
        </div>

        <div className="flex gap-4">
          {/* Album Art */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded bg-terminal-bg">
              {post.track?.image ? (
                <Image
                  src={post.track.image}
                  alt={post.track?.title || "Track"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-90"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-phosphor-dim font-mono text-xs">—</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-mono text-sm text-phosphor line-clamp-1 group-hover:text-accent transition-colors duration-300">
              {post.track?.title || "Unknown Track"}
            </h3>
            <p className="font-mono text-xs text-phosphor-dim line-clamp-1 mt-1">
              {post.track?.artist || "Unknown Artist"}
            </p>
            
            {post.content && (
              <p className="font-mono text-[11px] text-phosphor-dim/60 mt-2 line-clamp-1">
                {post.content}
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default FeedPost;
