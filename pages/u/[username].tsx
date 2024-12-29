import React from "react";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import Layout from "@components/Layout";
import Username from "@components/Username";
import { PostProps } from "@components/Post";
import ProfileImage from "@components/ProfileImage";
import { User } from "@prisma/client";
import PostList from "@components/PostList";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const params = context.params;

  if (!params) {
    return {
      props: {
        drafts: [],
        user: null,
      },
    };
  }

  const { username } = params;

  const user = await prisma.user.findFirst({
    where: { name: username as string },
  });

  if (!user) {
    return {
      props: {
        drafts: [],
        user: null,
      },
    };
  }

  const drafts = await prisma.post.findMany({
    include: {
      author: { select: { name: true, image: true } },
      track: {
        select: { artist: true, title: true, sourceId: true, image: true },
      },
    },
    where: { authorId: user.id },
  });

  return {
    props: {
      user,
      drafts: drafts.map((draft) => ({
        ...draft,
        createdAt: draft.createdAt.toISOString(),
      })),
    },
  };
};

type ProfileProps = {
  drafts: PostProps[];
  user: User;
};

const Profile: React.FC<ProfileProps> = (props) => {
  const { drafts, user } = props;

  if (!user) {
    return null;
  }

  const username = props?.user?.name;

  return (
    <Layout>
      <div className="py-8 pb-8 flex flex-col items-center sm:flex-row sm:gap-4 sm:items-center">
        <div className="mb-2 sm:mb-0">
          <ProfileImage username={username} />
        </div>
        <Username>{username}</Username>
      </div>
      {drafts && drafts.length > 0 && (
        <div className="w-full">
          <PostList posts={drafts} showAuthor={false} />
        </div>
      )}
    </Layout>
  );
};

export default Profile;
