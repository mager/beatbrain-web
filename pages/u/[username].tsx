import React from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useParams } from "next/navigation";
import prisma from "../../lib/prisma";
import Layout from "@components/Layout";
import Username from "@components/Username";
import { Draft } from "@components/Post";
import ProfileImage from "@components/ProfileImage";
import { User } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const params = context.params;
  const defaultProps = {
    props: {
      drafts: [],
      user: null,
    },
  };

  if (!params) {
    return defaultProps;
  }

  const { username } = params;
  const user = await prisma.user.findFirst({
    where: {
      name: username as string,
    },
  });

  if (!user) {
    return defaultProps;
  }

  const { id } = user;

  const drafts = await prisma.post.findMany({
    select: {
      content: true,
      track: true,
      createdAt: true,
    },
    where: {
      authorId: id,
    },
  });

  const props = {
    user,
    drafts: [],
  };

  if (!drafts || drafts.length == 0) {
    return {
      props,
    };
  }

  props.drafts = drafts;

  return {
    props: {
      user,
      drafts,
    },
  };
};

type ProfileProps = {
  drafts: Draft[];
  user: User;
};

const Profile: React.FC<ProfileProps> = (props) => {
  const params = useParams();
  if (!params) {
    return null;
  }

  const { drafts, user } = props;

  if (!user) {
    return null;
  }

  const { username } = params;

  return (
    <Layout>
      <div className="py-8 pb-8 flex flex-col items-center sm:flex-row sm:gap-4 sm:items-center">
        <div className="mb-4 sm:mb-0">
          <ProfileImage username={username} />
        </div>
        <Username>{username}</Username>
      </div>
      {drafts && drafts.length > 0 && (
        <div className="w-full">
          {drafts.map(({ content, createdAt, track }) => (
            <div className="flex justify-between items-center gap-2 mb-4">
              <div className="flex">
                <div>
                  <Image
                    width={48}
                    height={48}
                    src={track.image}
                    alt="thumb"
                    unoptimized
                  />
                </div>
                <div className="ml-2">
                  <div>{track.title}</div>
                  <div>{content}</div>
                </div>
              </div>
              <div>{createdAt.toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Profile;
