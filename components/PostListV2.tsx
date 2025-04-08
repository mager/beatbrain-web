import React from "react";
import type { PostProps } from "./Post"; // Assuming PostProps has the necessary fields

interface PostListItemProps {
  post: PostProps;
}

const formatDate = (dateInput: Date | string): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

const PostListItem: React.FC<PostListItemProps> = ({ post }) => {
  const { track, createdAt, content } = post;

  return (
    <div className="flex flex-col p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-start mb-2">
         <span className="text-xs text-gray-500 dark:text-gray-400">
           {formatDate(createdAt)}
         </span>
        {track?.image && <img src={track.image} alt={`${track.title} cover`} className="w-8 h-8 rounded ml-2"/>}
      </div>

       <div className="mb-2">
          <p className="font-semibold text-gray-800 dark:text-gray-100 truncate" title={track?.title}>
            {track?.title || "Unknown Title"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate" title={track?.artist}>
            {track?.artist || "Unknown Artist"}
          </p>
       </div>


      {content && (
        <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 bg-gray-50 dark:bg-gray-700 p-2 rounded text-pretty break-words">
          {content}
        </p>
      )}
       {!content && (
         <p className="text-sm text-gray-400 dark:text-gray-500 italic mt-1">
           No comment added.
         </p>
       )}
    </div>
  );
};

type PostListV2Props = {
  posts: PostProps[];
};

const PostListV2: React.FC<PostListV2Props> = ({ posts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      {posts.map((post) => (
        <PostListItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostListV2;