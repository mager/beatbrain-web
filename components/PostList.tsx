import React from "react";
import Post, { PostProps } from "./Post";

type PostListProps = {
  posts: PostProps[];
  showAuthor?: boolean;
};

const PostList: React.FC<PostListProps> = ({ posts, showAuthor = true }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 my-2">
      {posts.map((post) => (
        <div key={post.id} className="post">
          <Post post={post} showAuthor={showAuthor} />
        </div>
      ))}
    </div>
  );
};

export default PostList;
