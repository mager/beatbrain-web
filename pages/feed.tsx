import React from "react";
import type { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from "../lib/prisma";
import Title from "../components/Title";
import Box from "@components/Box";

export const getServerSideProps: GetServerSideProps = async () => {
  const feed = await prisma.post.findMany({
    include: {
      author: {
        select: {
          name: true,
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

const Blog: React.FC<Props> = (props) => {
  return (
    <Layout>
      <Box>
        <Title>Public Feed</Title>
        <div className="flex flex-col space-y-4 my-4">
          {props.feed.map((post) => (
            <div
              key={post.id}
              className="post bg-white rounded-md py-2 cursor-pointer"
            >
              <Post post={post} />
            </div>
          ))}
        </div>
      </Box>
    </Layout>
  );
};

export default Blog;
