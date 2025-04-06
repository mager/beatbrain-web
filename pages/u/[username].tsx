import React from "react";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import Username from "@components/Username";
import type { PostProps } from "@components/Post"; 
import ProfileImage from "@components/ProfileImage";
import type { User } from "@prisma/client"; 
import PostList from "@components/PostList";
import Box from "@components/Box"; 
export const getServerSideProps: GetServerSideProps = async (context) => {
  const params = context.params;

  if (!params || !params.username || typeof params.username !== 'string') {
    console.log("Profile page: Invalid or missing username param");
    return { notFound: true };
  }

  const { username } = params; // This is the username from the URL

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      console.log(`Profile page: User not found - ${username}`);
      return { notFound: true };
    }

    const drafts = await prisma.post.findMany({
      include: {
        author: { select: { name: true, image: true } },
        track: {
          select: { artist: true, title: true, sourceId: true, image: true },
        },
      },
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const serializedDrafts = drafts.map((draft) => ({
      ...draft,
      createdAt: draft.createdAt.toISOString(),
    }));

    return {
      props: {
        user,
        drafts: serializedDrafts,
      },
    };
  } catch (error) {
    console.error("Error in profile getServerSideProps:", error);
    return { notFound: true };
  }
};


type ProfileProps = {
  drafts: PostProps[];
  user: User; // user should always be present if notFound wasn't returned
};

const Profile: React.FC<ProfileProps> = ({ user, drafts }) => {
  const username = user.name;

  return (
    // Use Box or a similar container for consistent padding/margin if desired
    <Box>
      <div className="py-4 pb-8 flex flex-col items-center sm:flex-row sm:items-center sm:gap-4 border-b border-gray-200 dark:border-gray-700 mb-6"> {/* Added border and margin */}
        <div className="mb-2 sm:mb-0 flex-shrink-0"> {/* Prevent image shrinking */}
          <ProfileImage username={username} />
        </div>
        <Username>{username}</Username>
      </div>
      {drafts && drafts.length > 0 ? (
        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-4">Saved Tracks</h2> {/* Added section title */}
          <PostList posts={drafts} showAuthor={false} />
        </div>
      ) : (
         <div className="text-center text-gray-500 py-10">
             {username} hasn't saved any tracks yet.
         </div> // Message when user has no posts
      )}
    </Box>
  );
};

export default Profile;