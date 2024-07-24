import Image from "next/image";
import React from "react";

type Props = {
  username: string | string[];
  height?: number;
  width?: number;
};

const ProfileImage: React.FC<Props> = ({
  username,
  height = 64,
  width = 48,
}) => {
  return (
    <Image
      alt="profile"
      src={`https://github.com/${username}.png`}
      width={width}
      height={height}
      className="rounded-full"
      unoptimized
    />
  );
};

export default ProfileImage;
