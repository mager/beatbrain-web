import React from "react";
import Post, { Draft, PostProps } from "./Post";

type PostListProps = {
  posts: PostProps[] | Draft[];
  showAuthor?: boolean;
};

const PostList: React.FC<PostListProps> = ({ posts, showAuthor = true }) => {
  return (
    <div className="flex flex-col space-y-4 my-4">
      {posts.map((post) => (
        <div key={post.id} className="post cursor-pointer">
          <Post post={post} showAuthor={showAuthor} />
        </div>
      ))}
    </div>
  );
};

export default PostList;
