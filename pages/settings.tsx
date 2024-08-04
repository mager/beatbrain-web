import React, { useState } from "react";
import Layout from "../components/Layout";

import { options } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import GiantTitle from "@components/GiantTitle";
import Input from "@components/Input";
import prisma from "../lib/prisma";
import { Profile } from "@types";
import Subtitle from "@components/Subtitle";

const Settings: React.FC = () => {
  const [username, setUsername] = useState("");

  return (
    <Layout>
      <div className="py-4">
        <GiantTitle>Settings</GiantTitle>
        {/* {profile && (
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
        )} */}
      </div>
    </Layout>
  );
};

export default Settings;
