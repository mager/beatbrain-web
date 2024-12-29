import React from "react";
import Link from "next/link"; // Use Link instead of Router for better SEO

export type TrackProps = {
  id?: number; // Added optional id
  title?: string;
  artist?: string;
  image?: string;
  source?: string;
  sourceId?: string;
};

export type AuthorProps = {
  name?: string;
  email?: string;
  image?: string;
};

export type PostProps = {
  id: number;
  title?: string;
  createdAt: Date;
  author: AuthorProps | null;
  track: TrackProps | null;
  content: string;
};

type Props = {
  post: PostProps;
  showAuthor?: boolean;
};

const Post: React.FC<Props> = ({ post, showAuthor = true }) => {
  const authorName = post.author?.name || "Unknown author";
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
  const trackTitle = post.track?.title || "Untitled Track";
  const trackArtist = post.track?.artist || "Unknown Artist";

  return (
    <Link href={`/ext/spotify/${post.track?.sourceId || ""}`} passHref>
      <div className="flex flex-col md:flex-row items-start gap-2 bg-white rounded-lg p-2 border-2 border-transparent hover:border-green-300 hover:shadow-none transition-all duration-100">
        <div className="flex items-center gap-2 w-full">
          {post.track?.image && (
            <img
              src={post.track.image}
              alt={trackTitle}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex justify-between items-center w-full p-2 rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">{trackTitle}</h3>
              <p className="text-gray-600">{trackArtist}</p>
            </div>
            <p className="text-gray-400 italic text-right">{formattedDate}</p>
          </div>
        </div>
        {showAuthor && (
          <div className="flex flex-col md:flex-row items-start gap-2 mt-2 md:mt-0">
            {post.author?.image && (
              <img
                src={post.author.image}
                alt={authorName}
                className="w-12 h-12 rounded-lg object-cover md:w-16 md:h-16"
              />
            )}
            <div>
              <p className="font-bold text-gray-700">@{authorName}</p>
              <p className="text-gray-600 text-sm italic mt-1">
                {post.content}
              </p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Post;
