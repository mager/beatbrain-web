import Image from "next/image";
import React from "react";

type Props = {
  username: string | string[];
};

const ProfileImage: React.FC<Props> = ({ username }) => {
  return (
    <Image
      alt="profile"
      src={`https://github.com/${username}.png`}
      width={64}
      height={64}
      className="rounded-full"
      unoptimized
    />
  );
};

export default ProfileImage;
