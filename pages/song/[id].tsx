import React from "react";
import { GetServerSideProps } from "next";
import ReactMarkdown from "react-markdown";
import Layout from "../../components/Layout";
import Router from "next/router";
import { PostProps } from "../../components/Post";
import prisma from "../../lib/prisma";
import { useSession } from "next-auth/react";
import Box from "@components/Box";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(params?.id) || -1,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  return {
    props: post,
  };
};

async function deletePost(id: number): Promise<void> {
  await fetch(`/api/post/${id}`, {
    method: "DELETE",
  });
  await Router.push("/");
}

const Post: React.FC<PostProps> = (props) => {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Authenticating ...</div>;
  }
  const userHasValidSession = Boolean(session);
  const postBelongsToUser = session?.user?.email === props.author?.email;
  return (
    <Layout>
      <Box>
        <h2 className="text-3xl font-bold mb-4">{props.title}</h2>
        <p className="text-gray-600 mb-6">
          {props?.author?.name || "Unknown author"}
        </p>
        <div className="prose max-w-none">
          <ReactMarkdown children={props.content} />
        </div>
        {userHasValidSession && postBelongsToUser && (
          <div className="mt-6">
            <button
              onClick={() => deletePost(props.id)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Delete
            </button>
          </div>
        )}
      </Box>
    </Layout>
  );
};

export default Post;
