import React from "react";
import Layout from "../components/Layout";

import { options } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import GiantTitle from "@components/GiantTitle";

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

  return {
    props: {
      user: session.user,
    },
  };
}

type Props = {
  user: {
    name: string;
    email: string;
    image: string;
  };
};

const Settings: React.FC<Props> = ({ user }) => {
  return (
    <Layout>
      <div className="py-4">
        <GiantTitle>Settings</GiantTitle>
      </div>
    </Layout>
  );
};

export default Settings;
