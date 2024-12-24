import React from "react";
import { useSession } from "next-auth/react";

import AuthMenu from "@components/AuthMenu";
import UsernameLink from "@components/UsernameLink";

const Crown = () => {
  const { data: session } = useSession();
  const username = session?.user.name.toLowerCase();
  if (!session) {
    return null;
  }

  return (
    <div className="md:hidden bg-black text-white flex px-8 py-2 justify-end">
      {username && <UsernameLink username={username} />}
      <AuthMenu />
    </div>
  );
};

export default Crown;
