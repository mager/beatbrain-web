import React from "react";
import type { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from "../lib/prisma";
import Title from "../components/Title";

export const getServerSideProps: GetServerSideProps = async () => {
  const feed = await prisma.post.findMany({
    where: {
      published: true,
    },
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
      <div className="py-4">
        <Title>
          <span className="text-4xl font-mono">beatbrain</span>{" "}
          <span className="text-xl">
            Share and discover your favorite tunes
          </span>
        </Title>
      </div>
    </Layout>
  );
};

export default Blog;
