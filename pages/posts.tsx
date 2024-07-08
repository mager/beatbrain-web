import React from "react";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import Title from "../components/Title";
import Post, { PostProps } from "../components/Post";
import { useSession, getSession } from "next-auth/react";
import prisma from "../lib/prisma";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 403;
    return { props: { drafts: [] } };
  }

  const drafts = await prisma.post.findMany({
    where: {
      author: { email: session.user.email },
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  return {
    props: { drafts },
  };
};

type Props = {
  drafts: PostProps[];
};

const Posts: React.FC<Props> = (props) => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Layout>
        <Title>Posts</Title>
        <div className="text-center">
          You need to be authenticated to view this page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-4">
        <Title>Posts</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {props.drafts.map((post) => (
            <div
              key={post.id}
              className="post bg-white rounded-md shadow-md hover:shadow-lg transition-shadow duration-150 ease-in-out p-4"
            >
              <Post post={post} />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Posts;
