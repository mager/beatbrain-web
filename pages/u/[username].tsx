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
  const memberSince = new Date(user.createdAt).toISOString().substring(0, 10);

  return (
    <Box className="min-h-screen">
      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none grid-overlay opacity-30" />
      
      <div className="relative max-w-5xl mx-auto px-4 md:px-8 pt-24 pb-16">
        {/* Profile Header - Terminal Style */}
        <div className="terminal-window mb-10">
          <div className="terminal-titlebar">user_profile --user={user.username || 'unknown'}</div>
          <div className="p-6 font-mono">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user.image ? (
                  <div className="w-24 h-24 border border-terminal-border overflow-hidden">
                    <Image
                      src={user.image}
                      alt={user.name || user.username || "User"}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                    {/* Surveillance corners */}
                    <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-matrix/60" />
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-matrix/60" />
                    <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-matrix/60" />
                    <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-matrix/60" />
                  </div>
                ) : (
                  <div className="w-24 h-24 border border-terminal-border bg-terminal-bg flex items-center justify-center text-3xl font-display text-matrix">
                    {(user.name || user.username || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Data Readout */}
              <div className="flex-1 space-y-2 text-xs">
                <h1 className="text-xl text-phosphor font-bold mb-3">
                  {user.name || user.username}
                </h1>
                
                {user.username && (
                  <div className="flex gap-4">
                    <span className="text-phosphor-dim w-20">HANDLE:</span>
                    <span className="text-cyber">@{user.username}</span>
                  </div>
                )}
                <div className="flex gap-4">
                  <span className="text-phosphor-dim w-20">TRACKS:</span>
                  <span className="text-matrix">{posts.length}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-phosphor-dim w-20">JOINED:</span>
                  <span className="text-phosphor">{memberSince}</span>
                </div>
                {user.spotifyId && (
                  <div className="flex gap-4">
                    <span className="text-phosphor-dim w-20">SPOTIFY:</span>
                    <span className="text-matrix flex items-center gap-1.5">
                      CONNECTED
                      <span className="w-1.5 h-1.5 rounded-full bg-matrix animate-pulse inline-block" />
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
              <span className="text-[10px] text-phosphor-dim block mb-1">
                // COLLECTION — {posts.length} tracks indexed
              </span>
              <h2 className="text-sm text-phosphor">
                <span className="text-matrix mr-2">$</span>
                ls ~/collection/
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/ext/spotify/${post.track?.sourceId || ""}`}
                  className="group relative aspect-square overflow-hidden border border-terminal-border hover:border-matrix/50 transition-all duration-300 bg-terminal-surface opacity-0 animate-fadeUp"
                  style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'forwards' }}
                >
                  {post.track?.image ? (
                    <Image
                      src={post.track.image}
                      alt={post.track?.title || "Track"}
                      fill
                      className="object-cover transition-all duration-500 group-hover:opacity-70 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-terminal-bg flex items-center justify-center">
                      <span className="font-mono text-[10px] text-phosphor-dim">NO_DATA</span>
                    </div>
                  )}
                  
                  {/* Scanline overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Info */}
                  <div className="absolute inset-x-0 bottom-0 p-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <p className="font-mono text-[11px] text-phosphor line-clamp-1">
                      {post.track?.title}
                    </p>
                    <p className="font-mono text-[9px] text-phosphor-dim line-clamp-1">
                      {post.track?.artist}
                    </p>
                  </div>

                  {/* Corner brackets */}
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-matrix/0 group-hover:border-matrix/50 transition-all duration-300" />
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-matrix/0 group-hover:border-matrix/50 transition-all duration-300" />
                  <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-matrix/0 group-hover:border-matrix/50 transition-all duration-300" />
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-matrix/0 group-hover:border-matrix/50 transition-all duration-300" />
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="terminal-window">
            <div className="terminal-titlebar">collection.log</div>
            <div className="p-8 text-center font-mono">
              <div className="text-phosphor-dim text-sm mb-2">
                $ ls ~/collection/
              </div>
              <p className="text-phosphor-dim text-xs">
                EMPTY_DIRECTORY — no tracks indexed yet
              </p>
              <p className="text-matrix text-xs mt-4 animate-blink">_</p>
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export default Profile;
