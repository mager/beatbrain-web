import type { GetServerSideProps } from "next";
import Head from "next/head";
import AdminMembers from "../components/AdminMembers";
import AdminInvites from "../components/AdminInvites";
import { getSession } from "../lib/auth-api";
import { isOwner, PRIVATE_CACHE_CONTROL } from "../lib/access";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
  const session = await getSession(req);
  if (!session)
    return {
      redirect: {
        destination: "/auth/signin?callbackUrl=%2Fadmin",
        permanent: false,
      },
    };
  if (!isOwner(session.user)) return { notFound: true };
  return { props: { sender: session.user.name || "mager" } };
};
export default function Admin({ sender }: { sender: string }) {
  return (
    <div className="room-container admin-page">
      <Head>
        <title>Admin — Beatbrain</title>
      </Head>
      <h1>Bring your people.</h1>
      <p className="muted">Your members and their next music friends.</p>
      <AdminMembers />
      <AdminInvites sender={sender} />
    </div>
  );
}
