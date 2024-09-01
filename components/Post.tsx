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
  content: string;
};

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  const authorName = post.author ? post.author.name : "Unknown author";
  return (
    <div onClick={() => Router.push("/p/[id]", `/p/${post.id}`)}>
      <h2>
        @{authorName} - TODO - {post.content}
      </h2>
    </div>
  );
};

export default Post;
