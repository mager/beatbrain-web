import React, { useState } from "react";
import Layout from "../components/Layout";

import { options } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import GiantTitle from "@components/GiantTitle";
import Input from "@components/Input";
import prisma from "../lib/prisma";
import { Profile } from "@types";
import Subtitle from "@components/Subtitle";

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, options);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // @ts-ignore
  const userId = session?.id;
  const profile = await prisma.profile.findFirst({
    where: {
      userId,
    },
  });

  const defaultProps = {
    profile: null,
  };

  if (!profile) {
    return defaultProps;
  }

  return {
    profile,
  };
}

type Props = {
  profile: Profile;
};

const Settings: React.FC<Props> = (props) => {
  const [username, setUsername] = useState("");

  const { profile } = props;
  return (
    <Layout>
      <div className="py-4">
        <GiantTitle>Settings</GiantTitle>
        {profile && (
          <div className="py-4">
            <div>{profile.username}</div>
          </div>
        )}
        {!profile && (
          <div className="py-4">
            <Subtitle>Set your username</Subtitle>
            <div>
              <Input
                placeholder="Choose a username"
                value={username}
                setValue={setUsername}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Settings;
