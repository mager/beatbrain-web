import React from "react";
import Router from "next/router";

export type Draft = {
  track: TrackProps;
  content: string;
  createdAt: Date;
};

export type TrackProps = {
  id: number;
  title: string;
  artist: string;
  image: string;
  source: string;
  sourceId: string;
};

export type PostProps = {
  id: number;
  title: string;
  createdAt: Date;
  author: {
    name: string;
    email: string;
    image: string;
  } | null;
  track: {
    artist: string;
    title: string;
    sourceId: string;
    image: string;
  } | null;
  content: string;
};

type Props = {
  post: PostProps;
  showAuthor?: boolean;
};

const Post: React.FC<Props> = ({ post, showAuthor = true }) => {
  const authorName = post.author ? post.author.name : "Unknown author";
  const formattedDate = post.createdAt
    ? post.createdAt.toLocaleDateString()
    : "";

  return (
    <div
      onClick={() => Router.push(`/ext/spotify/${post.track?.sourceId}`)}
      className="bg-white rounded-lg cursor-pointer"
    >
      <div className="flex flex-col md:flex-row items-start gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4 w-full">
          <img
            src={post.track?.image}
            alt={post.track?.title}
            className="w-14 h-14 rounded-lg"
          />
          <div className="flex-grow">
            <p className="font-semibold">{post.track?.title}</p>
            <p className="text-gray-600">{post.track?.artist}</p>
          </div>
        </div>
        {showAuthor && (
          <div className="flex items-center gap-4 w-full">
            <img
              src={post.author?.image}
              alt={authorName}
              className="w-14 h-14 rounded-lg"
            />
            <div className="flex-grow">
              <h2 className="text-xl font-bold">@{authorName}</h2>
              <p className="text-gray-600 italic">{post.content}</p>
            </div>
          </div>
        )}
        {/* TODO: Fix me */}
        <div className="flex items-center gap-4 w-full">
          {formattedDate && (
            <p className="text-gray-600 italic">{formattedDate}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
