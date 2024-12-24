import React from "react";
import Link from "next/link";
import ProfileImage from "./ProfileImage";

const UsernameLink = ({ username }) => {
  return (
    <div className="mx-2 flex items-center">
      <Link href={`/u/${username}`}>
        <ProfileImage height={32} width={32} username={username} />
      </Link>
    </div>
  );
};

export default UsernameLink;
