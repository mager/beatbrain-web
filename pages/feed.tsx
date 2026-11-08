import type { GetServerSideProps } from "next";
import Link from "next/link";
import { getFeed } from "../lib/feed";
import { getSession } from "../lib/auth-api";
import PostGrid, { type FeedPost } from "../components/PostGrid";
export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const session = await getSession(req);
  if (!session)
    return { redirect: { destination: "/auth/signin", permanent: false } };
  const friends = query.view === "friends";
  const posts = await getFeed(session.user.id, friends, 48);
  return {
    props: {
      posts,
      friends,
    },
  };
};
export default function Feed({
  posts,
  friends,
}: {
  posts: FeedPost[];
  friends: boolean;
}) {
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
          <h1 className="display-title">Feed</h1>
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
        </div>
      </section>
      <nav className="feed-view-switch" aria-label="Feed view">
        <Link href="/feed" aria-current={!friends ? "page" : undefined}>
          Everyone
        </Link>
        <Link
          href="/feed?view=friends"
          aria-current={friends ? "page" : undefined}
        >
          Friends
        </Link>
      </nav>
      {friends && !posts.length ? (
        <div className="empty-state">
          <h2>Find your music people.</h2>
          <p>
            Follow someone from their profile. Their tracks will appear here.
          </p>
          <Link href="/feed" className="button button-primary">
            Explore the room
          </Link>
        </div>
      ) : (
        <PostGrid posts={posts} />
      )}
    </div>
  );
}
