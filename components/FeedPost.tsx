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
  
  const timestamp = (() => {
    const date = new Date(post.createdAt);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  })();

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
        className="block border border-terminal-border hover:border-terminal-border-bright bg-terminal-surface p-4 transition-all duration-300 hover:shadow-terminal"
      >
        {/* Terminal log line header */}
        <div className="flex items-center gap-2 mb-3 font-mono text-[10px]">
          <span className="text-phosphor-dim">[{timestamp}]</span>
          <span className="text-cyber">
            {authorUsername ? `@${authorUsername}` : authorName}
          </span>
          <span className="text-phosphor-dim">saved track</span>
          <span className="text-matrix ml-auto">{timeAgo}</span>
        </div>

        <div className="flex gap-4">
          {/* Album Art - surveillance monitor style */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 overflow-hidden border border-terminal-border bg-terminal-bg">
              {post.track?.image ? (
                <Image
                  src={post.track.image}
                  alt={post.track?.title || "Track"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-80"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-phosphor-dim font-mono text-xs">NO_IMG</span>
                </div>
              )}
              {/* Corner brackets */}
              <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-matrix/40" />
              <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-matrix/40" />
              <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-matrix/40" />
              <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-matrix/40" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-mono text-sm text-phosphor line-clamp-1 group-hover:text-matrix transition-colors duration-300">
              &quot;{post.track?.title || "Unknown Track"}&quot;
            </h3>
            <p className="font-mono text-xs text-phosphor-dim line-clamp-1 mt-1">
              by {post.track?.artist || "Unknown Artist"}
            </p>
            
            {post.content && (
              <p className="font-mono text-[11px] text-phosphor-dim/60 mt-2 line-clamp-1">
                <span className="text-phosphor-dim">// </span>{post.content}
              </p>
            )}

            {/* Source ID */}
            {post.track?.sourceId && (
              <p className="font-mono text-[9px] text-phosphor-dim/40 mt-2">
                SRC:{post.track.sourceId}
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default FeedPost;
