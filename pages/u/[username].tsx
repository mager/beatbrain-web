import React, { useMemo } from "react";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import type { PostProps } from "@components/Post";
import type { User } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const params = context.params;
  if (!params || !params.username || typeof params.username !== 'string') {
    return { notFound: true };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
    });

    if (!user) return { notFound: true };

    const posts = await prisma.post.findMany({
      include: {
        author: { select: { name: true, image: true, username: true } },
        track: { select: { artist: true, title: true, sourceId: true, image: true } },
      },
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return {
      props: {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        posts: posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
      },
    };
  } catch (error) {
    console.error("Profile error:", error);
    return { notFound: true };
  }
};

type ProfileProps = {
  posts: PostProps[];
  user: User & { createdAt: string; updatedAt: string };
};

const Profile: React.FC<ProfileProps> = ({ user, posts }) => {
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Pick a few recent cover arts for the hero mosaic background
  const heroImages = useMemo(() => {
    const imgs: string[] = [];
    const seen = new Set<string>();
    for (const p of posts) {
      if (p.track?.image && !seen.has(p.track.image)) {
        seen.add(p.track.image);
        imgs.push(p.track.image);
      }
      if (imgs.length >= 12) break;
    }
    return imgs;
  }, [posts]);

  // Unique tracks for the grid
  const uniquePosts = useMemo(() => {
    const seen = new Set<string>();
    return posts.filter((p) => {
      const img = p.track?.image;
      if (!img || !p.track?.sourceId) return false;
      if (seen.has(img)) return false;
      seen.add(img);
      return true;
    });
  }, [posts]);

  // Top artists
  const topArtists = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach(p => {
      if (p.track?.artist) {
        counts.set(p.track.artist, (counts.get(p.track.artist) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [posts]);

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner: Mosaic of user's cover art ── */}
      {heroImages.length > 0 && (
        <div className="relative">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-0 overflow-hidden" style={{ maxHeight: '280px' }}>
            {heroImages.map((img, i) => (
              <div key={i} className="aspect-square relative overflow-hidden">
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
          {/* Fade to background */}
          <div className="absolute inset-0 bg-gradient-to-b from-terminal-bg/60 via-transparent to-terminal-bg" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-terminal-bg to-transparent" />
        </div>
      )}

      {/* ── Profile Info ── */}
      <div className="relative px-4 sm:px-6 -mt-16 z-10 max-w-5xl mx-auto">
        <div className="flex items-end gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            {user.image ? (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-sm overflow-hidden border-2 border-terminal-bg shadow-glow-accent">
                <Image
                  src={user.image}
                  alt={user.name || user.username || "User"}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-sm bg-terminal-surface border-2 border-terminal-bg flex items-center justify-center">
                <span className="text-4xl font-display text-accent">
                  {(user.name || user.username || "?").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name & handle */}
          <div className="pb-1">
            <h1 className="font-display text-2xl sm:text-3xl text-white tracking-tight">
              {user.name || user.username}
            </h1>
            {user.username && (
              <p className="font-mono text-sm text-cool mt-0.5">@{user.username}</p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-accent font-semibold text-lg">{uniquePosts.length}</span>
            <span className="text-phosphor-dim">tracks</span>
          </div>
          <span className="text-terminal-border">·</span>
          <div className="flex items-center gap-2">
            <span className="text-phosphor">{memberSince}</span>
          </div>
          {user.spotifyId && (
            <>
              <span className="text-terminal-border">·</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-phosphor-dim">spotify</span>
              </div>
            </>
          )}
        </div>

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="font-mono text-[10px] text-phosphor-dim uppercase tracking-wider mr-1">top artists</span>
            {topArtists.map((a) => (
              <span
                key={a.name}
                className="px-2.5 py-1 bg-terminal-surface border border-terminal-border rounded-sm font-mono text-[10px] text-phosphor"
              >
                {a.name}
                <span className="text-accent ml-1.5">{a.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Section divider ── */}
      <div className="px-4 sm:px-6 max-w-5xl mx-auto mt-8 mb-4">
        <div className="border-b border-terminal-border pb-2 flex items-end justify-between">
          <h2 className="font-display text-lg text-white tracking-tight">collection</h2>
          <span className="font-mono text-[10px] text-phosphor-dim">{uniquePosts.length} saved</span>
        </div>
      </div>

      {/* ── Cover Art Grid ── */}
      {uniquePosts.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-0 pb-16">
          {uniquePosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/ext/spotify/${post.track?.sourceId || ""}`}
              className="group relative aspect-square overflow-hidden bg-terminal-surface opacity-0 animate-fadeUp"
              style={{
                animationDelay: `${Math.min(index * 20, 500)}ms`,
                animationFillMode: 'forwards',
              }}
            >
              {post.track?.image ? (
                <Image
                  src={post.track.image}
                  alt={post.track?.title || "Track"}
                  fill
                  sizes="(max-width: 640px) 33.3vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 14.3vw, 12.5vw"
                  className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-[0.2]"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-terminal-bg flex items-center justify-center">
                  <span className="font-mono text-[10px] text-phosphor-dim">—</span>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Track info */}
              <div className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <p className="font-mono text-[10px] sm:text-xs text-white leading-tight line-clamp-2 drop-shadow-lg font-medium">
                  {post.track?.title}
                </p>
                <p className="font-mono text-[9px] sm:text-[10px] text-white/60 leading-tight line-clamp-1 mt-1 drop-shadow-lg">
                  {post.track?.artist}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center font-mono pb-16">
          <p className="text-phosphor-dim text-sm">no tracks saved yet</p>
          <p className="text-accent text-xs mt-4 animate-blink">_</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
