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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {props.feed.map((post) => (
            <div
              key={post.id}
              className="post bg-white rounded-md shadow-md hover:shadow-lg transition-shadow duration-150 ease-in-out p-4 cursor-pointer"
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
