import React, { useMemo, useState } from "react";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import type { PostProps } from "@types";
import type { User } from "@prisma/client";
import Image from "next/image";
import TasteDNA from "@components/TasteDNA";
import ActivityFeed from "@components/ActivityFeed";
import CoverGrid from "@components/CoverGrid";

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
  const [view, setView] = useState<'collection' | 'activity'>('collection');

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

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

  const topArtists = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach(p => {
      if (p.track?.artist) {
        counts.set(p.track.artist, (counts.get(p.track.artist) || 0) + 1);
      }
    });
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }));
  }, [posts]);

  const activityByDate = useMemo(() => {
    const groups: { date: string; posts: PostProps[] }[] = [];
    let currentDate = "";
    for (const post of posts.slice(0, 50)) {
      const dateKey = new Date(post.createdAt).toLocaleDateString("en-US");
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: post.createdAt as unknown as string, posts: [post] });
      } else {
        groups[groups.length - 1].posts.push(post);
      }
    }
    return groups;
  }, [posts]);

  const gridItems = uniquePosts.map(p => ({
    id: p.id,
    image: p.track?.image,
    title: p.track?.title,
    artist: p.track?.artist,
    sourceId: p.track?.sourceId,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      {heroImages.length > 0 && (
        <div className="relative">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-0 overflow-hidden" style={{ maxHeight: '280px' }}>
            {heroImages.map((img, i) => (
              <div key={i} className="aspect-square relative overflow-hidden">
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-terminal-bg/60 via-transparent to-terminal-bg" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-terminal-bg to-transparent" />
        </div>
      )}

      {/* Profile Header */}
      <div className="relative px-4 sm:px-6 -mt-16 z-10 max-w-5xl mx-auto">
        <div className="flex items-end gap-5">
          <div className="flex-shrink-0">
            {user.image ? (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-sm overflow-hidden border-2 border-terminal-bg shadow-glow-accent">
                <Image src={user.image} alt={user.name || user.username || "User"} width={128} height={128} className="w-full h-full object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-sm bg-terminal-surface border-2 border-terminal-bg flex items-center justify-center">
                <span className="text-4xl font-display text-accent">
                  {(user.name || user.username || "?").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="font-display text-2xl sm:text-3xl text-white tracking-tight">
              {user.name || user.username}
            </h1>
            {user.username && <p className="font-mono text-sm text-cool mt-0.5">@{user.username}</p>}
            <p className="font-mono text-xs text-phosphor-dim mt-1 italic">No bio yet</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-accent font-semibold text-lg">{uniquePosts.length}</span>
            <span className="text-phosphor-dim">tracks</span>
          </div>
          <span className="text-terminal-border">·</span>
          <div className="flex items-center gap-2">
            <span className="text-accent font-semibold text-lg">{topArtists.length}</span>
            <span className="text-phosphor-dim">artists</span>
          </div>
          <span className="text-terminal-border">·</span>
          <span className="text-phosphor">{memberSince}</span>
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
      </div>

      {/* Taste DNA */}
      <div className="px-4 sm:px-6 max-w-5xl mx-auto mt-10">
        <TasteDNA artists={topArtists} />
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 max-w-5xl mx-auto mt-10 mb-4">
        <div className="tab-bar">
          <button onClick={() => setView('collection')} className={`tab-item ${view === 'collection' ? 'active' : ''}`}>
            collection <span className="text-phosphor-dim ml-2">{uniquePosts.length}</span>
          </button>
          <button onClick={() => setView('activity')} className={`tab-item ${view === 'activity' ? 'active' : ''}`}>
            activity <span className="text-phosphor-dim ml-2">{posts.length}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'collection' && (
        <CoverGrid items={gridItems} className="pb-16" />
      )}

      {view === 'activity' && (
        <div className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
          <ActivityFeed groups={activityByDate} />
        </div>
      )}
    </div>
  );
};

export default Profile;
