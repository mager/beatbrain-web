import React from "react";
import type { PostProps } from "./Post";
import Link from "next/link";

interface PostListItemV3Props {
  post: PostProps;
}

const formatDateShort = (dateInput: Date | string): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);

  const options: Intl.DateTimeFormatOptions = {
    month: "2-digit",
    day: "2-digit",
  };

  if (date.getFullYear() === lastYear.getFullYear()) {
    options.year = "2-digit";
  } else if (date.getFullYear() !== today.getFullYear()) {
    options.year = "2-digit";
  }

  return date.toLocaleDateString(undefined, options);
};

const PostListItemV3: React.FC<PostListItemV3Props> = ({ post }) => {
  const { track, createdAt, content } = post;
  const trackTitle = track?.title || "Untitled Track";
  const trackArtist = track?.artist || "Unknown Artist";

  return (
    <div className="flex gap-6 items-start py-6 md:gap-8">
      <div className="w-24 h-24 flex-shrink-0 md:w-32 md:h-32">
        {track?.image && (
          <Link href={`/ext/spotify/${post.track?.sourceId || ""}`} passHref>
            <img
              src={track.image}
              alt={trackTitle}
              className="w-full h-full object-cover"
            />
          </Link>
        )}
      </div>
      <div className="flex flex-col justify-between flex-grow">
        <div>
          <h2
            className="text-lg font-semibold text-gray-900 md:text-xl" // Slightly larger title
            title={trackTitle}
          >
            <Link href={`/ext/spotify/${post.track?.sourceId || ""}`} passHref>
              {trackTitle}
            </Link>
          </h2>
          <p className="text-sm text-gray-600 md:text-base" title={trackArtist}>
            <Link href={`/ext/spotify/${post.track?.sourceId || ""}`} passHref>
              {trackArtist}
            </Link>
          </p>
        </div>

        <div className="mt-2 md:mt-3">
          {content && (
            <p className="mt-1 text-sm text-gray-800 break-words md:text-base">
              <span className="text-xs text-gray-500 mr-2 md:mr-3">
                {formatDateShort(createdAt)}
              </span>
              {content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

type PostListV3Props = {
  posts: PostProps[];
};

const PostListV3: React.FC<PostListV3Props> = ({ posts }) => {
  return (
    <div className="divide-y divide-gray-300 dark:divide-gray-600 max-w-2xl mx-auto">
      {posts.map((post) => (
        <PostListItemV3 key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostListV3;
