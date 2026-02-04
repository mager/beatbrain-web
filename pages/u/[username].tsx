import React from "react";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import type { PostProps } from "@components/Post";
import type { User } from "@prisma/client";
import Box from "@components/Box";
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

  return (
    <Box className="min-h-screen">
      <div className="relative max-w-5xl mx-auto px-4 md:px-8 pt-24 pb-16">
        {/* Profile Header */}
        <div className="terminal-window mb-10">
          <div className="terminal-titlebar">{user.username || 'profile'}</div>
          <div className="p-6 font-mono">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user.image ? (
                  <div className="w-24 h-24 rounded overflow-hidden">
                    <Image
                      src={user.image}
                      alt={user.name || user.username || "User"}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded bg-terminal-bg flex items-center justify-center text-3xl font-display text-accent">
                    {(user.name || user.username || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Data */}
              <div className="flex-1 space-y-2 text-xs">
                <h1 className="text-xl text-phosphor font-semibold mb-3">
                  {user.name || user.username}
                </h1>
                
                {user.username && (
                  <div className="flex gap-4">
                    <span className="text-phosphor-dim w-20">handle</span>
                    <span className="text-cool">@{user.username}</span>
                  </div>
                )}
                <div className="flex gap-4">
                  <span className="text-phosphor-dim w-20">tracks</span>
                  <span className="text-accent">{posts.length}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-phosphor-dim w-20">joined</span>
                  <span className="text-phosphor">{memberSince}</span>
                </div>
                {user.spotifyId && (
                  <div className="flex gap-4">
                    <span className="text-phosphor-dim w-20">spotify</span>
                    <span className="text-accent flex items-center gap-1.5">
                      connected
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/70 inline-block" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Tracks Grid */}
        {posts.length > 0 ? (
          <>
            <div className="mb-6 border-b border-terminal-border pb-3 font-mono">
              <span className="text-[10px] text-phosphor-dim block mb-1 uppercase tracking-wider">
                {posts.length} tracks
              </span>
              <h2 className="text-sm text-phosphor">
                collection
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/ext/spotify/${post.track?.sourceId || ""}`}
                  className="group relative aspect-square overflow-hidden rounded bg-terminal-surface opacity-0 animate-fadeUp"
                  style={{ animationDelay: `${index * 25}ms`, animationFillMode: 'forwards' }}
                >
                  {post.track?.image ? (
                    <Image
                      src={post.track.image}
                      alt={post.track?.title || "Track"}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-terminal-bg flex items-center justify-center">
                      <span className="font-mono text-[10px] text-phosphor-dim">—</span>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Info */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <p className="font-mono text-[11px] text-phosphor line-clamp-1">
                      {post.track?.title}
                    </p>
                    <p className="font-mono text-[9px] text-phosphor-dim line-clamp-1 mt-0.5">
                      {post.track?.artist}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="terminal-window">
            <div className="terminal-titlebar">collection</div>
            <div className="p-8 text-center font-mono">
              <p className="text-phosphor-dim text-sm">
                no tracks saved yet
              </p>
              <p className="text-accent text-xs mt-4 animate-blink">_</p>
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export default Profile;
