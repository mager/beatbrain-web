import type { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import type { FeedPost } from "../../components/PostGrid";
import ProfilePosts from "../../components/ProfilePosts";
type ProfileUser = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  createdAt: string;
};
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (typeof params?.username !== "string") return { notFound: true };
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      createdAt: true,
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
  return {
    props: {
      user: { ...user, createdAt: user.createdAt.toISOString() },
      posts: posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    },
  };
};
export default function Profile({
  user,
  posts,
}: {
  user: ProfileUser;
  posts: FeedPost[];
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
              {posts.length === 100 ? "+" : ""} posts
            </span>
          </p>
        </div>
      </section>
      <ProfilePosts posts={posts} />
    </div>
  );
}
