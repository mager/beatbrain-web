import type { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import type { FeedPost } from "../../components/PostGrid";
import ProfilePosts from "../../components/ProfilePosts";
import FollowButton from "../../components/FollowButton";
import { getSession } from "../../lib/auth-api";
type ProfileUser = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  createdAt: string;
};
export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  if (typeof params?.username !== "string") return { notFound: true };
  const session = await getSession(req);
  if (!session)
    return { redirect: { destination: "/auth/signin", permanent: false } };
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      createdAt: true,
      _count: { select: { followers: true, following: true } },
      followers: {
        where: { followerId: session.user.id },
        select: { followerId: true },
        take: 1,
      },
      following: {
        where: { followingId: session.user.id },
        select: { followingId: true },
        take: 1,
      },
    },
  });
  if (!user) return { notFound: true };
  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    take: 100,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { name: true, username: true, image: true } },
      track: {
        select: { title: true, artist: true, sourceId: true, image: true },
      },
    },
  });
  const { _count, followers, following, ...profileUser } = user;
  return {
    props: {
      user: { ...profileUser, createdAt: user.createdAt.toISOString() },
      posts: posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
      social: {
        initialFollowers: _count.followers,
        followingCount: _count.following,
        initialFollowing: followers.length > 0,
        followsYou: following.length > 0,
        isSelf: user.id === session.user.id,
      },
    },
  };
};
export default function Profile({
  user,
  posts,
  social,
}: {
  user: ProfileUser;
  posts: FeedPost[];
  social: {
    initialFollowers: number;
    followingCount: number;
    initialFollowing: boolean;
    followsYou: boolean;
    isSelf: boolean;
  };
}) {
  return (
    <div className="room-container profile-page">
      <section className="profile-intro">
        <span className="avatar profile-avatar">
          {user.image ? (
            <img src={user.image} alt="" width={88} height={88} />
          ) : (
            user.name[0]
          )}
        </span>
        <div>
          <h1>{user.name}</h1>
          <p>
            @{user.username}{" "}
            <span className="muted">
              / {posts.length}
              {posts.length === 100 ? "+" : ""}{" "}
              {posts.length === 1 ? "post" : "posts"}
            </span>
          </p>
          <FollowButton key={user.id} username={user.username} {...social} />
        </div>
      </section>
      <ProfilePosts posts={posts} />
    </div>
  );
}
