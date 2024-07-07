import React, { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const Crown = () => {
  const { data: session, status } = useSession();

  return (
    <div className="md:hidden bg-black text-white flex px-8 justify-between">
      <div>beatbrain</div>
      {session ? (
        <div>{session.user.name.toLowerCase()}</div>
      ) : (
        <div>Login</div>
      )}
    </div>
  );
};

export default Crown;
