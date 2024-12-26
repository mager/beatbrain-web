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
  author: {
    name: string;
    email: string;
  } | null;
  track: {
    artist: string;
    title: string;
    sourceId: string;
    image: string;
  } | null;
  content: string;
};

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  const authorName = post.author ? post.author.name : "Unknown author";
  return (
    <div
      onClick={() => Router.push("/p/[id]", `/p/${post.id}`)}
      className="bg-white rounded-lg cursor-pointer flex items-start p-2"
    >
      <img
        src={post.track?.image}
        alt={post.track?.title}
        className="w-14 h-14 rounded-lg mr-2"
      />
      <div>
        <h2 className="text-lg font-semibold">@{authorName}</h2>
        <p className="text-base mt-0.5">
          {post.track?.title} by {post.track?.artist}
        </p>
        <p className="text-base mt-0.5 italic">{post.content}</p>
      </div>
    </div>
  );
};

export default Post;
