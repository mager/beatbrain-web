import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { PostProps } from "@types";

type DateGroup = {
  date: string;
  posts: PostProps[];
};

type Props = {
  groups: DateGroup[];
};

const timeAgo = (dateStr: Date | string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDateHeader = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const ActivityFeed: React.FC<Props> = ({ groups }) => {
  if (groups.length === 0) {
    return (
      <div className="py-20 text-center font-mono">
        <p className="text-phosphor-dim text-sm">no activity yet</p>
        <p className="text-accent text-xs mt-4 animate-blink">_</p>
      </div>
    );
  }

  return (
    <div>
      {groups.map((group, gi) => (
        <div key={gi}>
          <div className="font-mono text-[10px] text-phosphor-dim uppercase tracking-wider py-3 border-b border-terminal-border/50 mb-1">
            {formatDateHeader(group.date)}
          </div>

          {group.posts.map((post) => (
            <Link
              key={post.id}
              href={`/ext/spotify/${post.track?.sourceId || ""}`}
              className="flex items-center gap-4 py-3 border-b border-terminal-border/30 hover:bg-terminal-surface/50 transition-colors -mx-2 px-2 rounded"
            >
              {post.track?.image ? (
                <div className="w-12 h-12 flex-shrink-0 relative rounded-sm overflow-hidden border border-terminal-border">
                  <Image
                    src={post.track.image}
                    alt={post.track?.title || ""}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-12 h-12 flex-shrink-0 bg-terminal-surface rounded-sm border border-terminal-border flex items-center justify-center">
                  <span className="text-phosphor-dim text-[10px]">—</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-white truncate">
                  {post.track?.title}
                </p>
                <p className="font-mono text-[10px] text-phosphor-dim truncate mt-0.5">
                  {post.track?.artist}
                </p>
              </div>

              <span className="font-mono text-[10px] text-phosphor-dim flex-shrink-0">
                {timeAgo(post.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
