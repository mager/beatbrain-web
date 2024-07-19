import React from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useParams } from "next/navigation";
import prisma from "../../lib/prisma";
import Layout from "@components/Layout";
import Username from "@components/Username";
import { Draft } from "@components/Post";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const params = context.params;

  if (!params) {
    return {
      props: {
        drafts: [],
      },
    };
  }

  const { username } = params;

  const result = await prisma.user.findFirst({
    where: {
      name: username as string,
    },
  });

  if (!result) {
    return {
      props: {
        drafts: [],
      },
    };
  }

  const { id } = result;

  const drafts = await prisma.post.findMany({
    select: {
      content: true,
      track: true,
    },
    where: {
      authorId: id,
    },
  });

  if (!drafts || drafts.length == 0) {
    return {
      props: {
        drafts: [],
      },
    };
  }

  return {
    props: {
      drafts,
    },
  };
};

type ProfileProps = {
  drafts: Draft[];
};

const Profile: React.FC<ProfileProps> = (props) => {
  const params = useParams();
  if (!params) {
    return null;
  }

  const { username } = params;
  const { drafts } = props;

  return (
    <Layout>
      <div className="py-8 pb-8 flex flex-col items-center sm:flex-row sm:gap-4 sm:items-center">
        <div className="mb-4 sm:mb-0">
          <Image
            alt="profile"
            src={`https://github.com/${username}.png`}
            width={64}
            height={64}
            className="rounded-full"
            unoptimized
          />
        </div>
        <Username>{username}</Username>
      </div>
      {drafts && drafts.length > 0 && (
        <div>
          {drafts.map(({ content, track }) => (
            <div className="flex items-center gap-2 mb-4">
              <div>
                <Image width={48} height={48} src={track.image} alt="thumb" />
              </div>
              <div>
                <div>{track.title}</div>
                <div>{content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Profile;
