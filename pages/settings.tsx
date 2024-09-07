import React, { useContext, useState, useEffect } from "react";
import Layout from "../components/Layout";
import { AppContext } from "../context/AppContext";
import GiantTitle from "@components/GiantTitle";
import Input from "@components/Input";
import prisma from "../lib/prisma";
import { Profile } from "@types";
import Subtitle from "@components/Subtitle";

const Settings: React.FC = () => {
  const context = useContext(AppContext);
  const { state } = context;
  const user = state?.user;
  const [username, setUsername] = useState(user?.username || "");
  const [isEditing, setIsEditing] = useState(!user?.username);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user?.username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to update username
    console.log("Updating username to:", username);
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="py-4">
        <GiantTitle>Settings</GiantTitle>
        <div className="py-4">
          <Subtitle>Username</Subtitle>
          {!isEditing ? (
            <div className="flex items-center space-x-4">
              <span>{username}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Choose a username"
                value={username}
                setValue={setUsername}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
