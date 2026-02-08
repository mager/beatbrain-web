import React, { useState, useMemo } from "react";
import type { GetServerSideProps } from "next";
import type { PostProps } from "../components/Post";
import prisma from "../lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const getServerSideProps: GetServerSideProps = async () => {
  const feed = await prisma.post.findMany({
    include: {
      author: {
        select: {
          name: true,
          image: true,
          username: true,
        },
      },
      track: {
        select: {
          artist: true,
          title: true,
          sourceId: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const serializedFeed = feed.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return {
    props: { feed: serializedFeed },
  };
};

type Props = {
  feed: PostProps[];
};

const Feed: React.FC<Props> = (props) => {
  const [filter, setFilter] = useState<'all' | 'recent'>('all');

  const posts = useMemo(() => {
    const seen = new Set<string>();
    const filtered = props.feed.filter((p) => {
      const img = p.track?.image;
      if (!img || !p.track?.sourceId) return false;
      if (seen.has(img)) return false;
      seen.add(img);
      return true;
    });

    if (filter === 'recent') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return filtered.filter(p => new Date(p.createdAt).getTime() > weekAgo);
    }
    return filtered;
  }, [props.feed, filter]);

  const timeAgo = (dateStr: Date | string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-end justify-between">
        <div>
          <h1 className="font-display text-xl md:text-2xl text-white tracking-tight">
            feed
          </h1>
          <p className="font-mono text-xs text-phosphor mt-1">
            <span className="text-accent font-semibold">{posts.length}</span>
            <span className="mx-1">discoveries from the community</span>
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <button
            onClick={() => setFilter('all')}
            className={`transition-colors duration-200 ${filter === 'all' ? 'text-accent' : 'text-phosphor-dim hover:text-phosphor'}`}
          >
            all
          </button>
          <span className="text-terminal-border">/</span>
          <button
            onClick={() => setFilter('recent')}
            className={`transition-colors duration-200 ${filter === 'recent' ? 'text-accent' : 'text-phosphor-dim hover:text-phosphor'}`}
          >
            this week
          </button>
        </div>
      </div>

      {/* Cover Art Wall */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-0 pb-16">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/ext/spotify/${post.track?.sourceId}`}
              className="group relative aspect-square overflow-hidden bg-terminal-surface opacity-0 animate-fadeUp"
              style={{
                animationDelay: `${Math.min(index * 15, 600)}ms`,
                animationFillMode: "forwards",
              }}
            >
              <Image
                src={post.track!.image!}
                alt={`${post.track?.artist} - ${post.track?.title}`}
                fill
                sizes="(max-width: 640px) 33.3vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 14.3vw, 12.5vw"
                className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-[0.2]"
                unoptimized
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Track info on hover */}
              <div className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <p className="font-mono text-[10px] sm:text-xs text-white leading-tight line-clamp-2 drop-shadow-lg font-medium">
                  {post.track?.title}
                </p>
                <p className="font-mono text-[9px] sm:text-[10px] text-white/60 leading-tight line-clamp-1 mt-1 drop-shadow-lg">
                  {post.track?.artist}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10">
                  <p className="font-mono text-[8px] sm:text-[9px] text-accent leading-tight">
                    {post.author?.username
                      ? `@${post.author.username}`
                      : post.author?.name || ""}
                  </p>
                  <p className="font-mono text-[8px] sm:text-[9px] text-white/30">
                    {timeAgo(post.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center font-mono">
          <p className="text-phosphor-dim text-sm">nothing here yet</p>
          <p className="text-accent text-xs mt-4 animate-blink">_</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
