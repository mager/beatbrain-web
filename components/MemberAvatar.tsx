import { useState } from "react";
export default function MemberAvatar({
  image,
  name,
  className = "",
}: {
  image?: string | null;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className={`avatar ${className}`} aria-hidden="true">
      {image && failed !== image ? (
        <img
          src={image}
          alt=""
          width={40}
          height={40}
          onError={() => setFailed(image)}
        />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}
