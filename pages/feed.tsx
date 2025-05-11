import React from "react";
import type { GetServerSideProps } from "next";
import FeedPost from "../components/FeedPost";
import type { PostProps } from "../components/Post";
import prisma from "../lib/prisma";
import Title from "../components/Title";
import Box from "@components/Box";

export const getServerSideProps: GetServerSideProps = async () => {
  const feed = await prisma.post.findMany({
    include: {
      author: {
        select: {
          name: true,
          image: true,
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
  });
  return {
    props: { feed },
  };
};

type Props = {
  feed: PostProps[];
};

const Feed: React.FC<Props> = (props) => {
  return (
      <Box>
        <Title>Public Feed</Title>
        <div className="flex flex-col space-y-4 my-4">
          {props.feed.map((post) => (
            <div key={post.id} className="post cursor-pointer">
              <FeedPost post={post} />
            </div>
          ))}
        </div>
      </Box>
  );
};

export default Feed;
