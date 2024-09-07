import React, { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const Crown = () => {
  const { data: session, status } = useSession();
  const username = session?.user.name.toLowerCase();

  if (!session) {
    return null;
  }

  return (
    <div className="md:hidden bg-black text-white flex px-8 justify-between">
      <div>beatbrain</div>
      <div title="Under Construction">🚧</div>
      {/* <div>
        <Link href={`/u/${username}`}>{username}</Link>
      </div> */}
    </div>
  );
};

export default Crown;
