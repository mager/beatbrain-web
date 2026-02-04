import React from "react";
import type { GetServerSideProps } from "next";
import FeedPost from "../components/FeedPost";
import type { PostProps } from "../components/Post";
import prisma from "../lib/prisma";
import Box from "@components/Box";

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
  return (
    <Box className="min-h-screen">
      <div className="relative max-w-3xl mx-auto px-4 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10 border-b border-terminal-border pb-4">
          <h1 className="font-display text-2xl md:text-3xl text-phosphor tracking-tight mb-2">
            feed
          </h1>
          <p className="font-mono text-xs text-phosphor-dim">
            {props.feed.length} discoveries
          </p>
        </div>

        {/* Posts */}
        {props.feed.length > 0 ? (
          <div className="space-y-2">
            {props.feed.map((post, index) => (
              <div 
                key={post.id} 
                className="opacity-0 animate-fadeUp"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <FeedPost post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="terminal-window">
            <div className="terminal-titlebar">feed</div>
            <div className="p-8 text-center font-mono">
              <p className="text-phosphor-dim text-sm">
                nothing here yet
              </p>
              <p className="text-accent text-xs mt-4 animate-blink">_</p>
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export default Feed;
