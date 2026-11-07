import type { GetServerSideProps } from "next";
import Link from "next/link";
import prisma from "../lib/prisma";
import PostGrid, { type FeedPost } from "../components/PostGrid";
export const getServerSideProps: GetServerSideProps = async () => {
  const posts = await prisma.post.findMany({
    take: 48,
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
      posts: posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    },
  };
};
export default function Home({ posts }: { posts: FeedPost[] }) {
  const people = Array.from(
    new Map(
      posts
        .filter((p) => p.author?.username)
        .map((p) => [p.author.username, p.author]),
    ).values(),
  );
  return (
    <div className="room-container">
      <section className="room-intro">
        <div>
          <h1>
            The listening room<span className="title-dot">.</span>
          </h1>
          <p>Good music sounds better when it comes from a friend.</p>
        </div>
        <div className="room-members">
          <div className="member-stack">
            {people.map((p) => (
              <Link
                key={p.username}
                href={`/u/${p.username}`}
                title={p.name}
                className="avatar"
              >
                {p.image ? (
                  <img src={p.image} width={34} height={34} alt={p.name} />
                ) : (
                  p.name[0]
                )}
              </Link>
            ))}
          </div>
          <span>Your people, on repeat.</span>
        </div>
      </section>
      <div className="feed-heading">
        <h2>On the turntable</h2>
        <span>Latest posts first</span>
      </div>
      <PostGrid posts={posts} />
    </div>
  );
}
