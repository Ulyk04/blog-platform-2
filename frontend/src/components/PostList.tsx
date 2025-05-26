import React from 'react';
import { Post } from '../types';
import { HashtagList } from './HashtagList';

interface PostListProps {
  posts: Post[];
}

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <div className="text-center text-gray-500">No posts found</div>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <img
              src={post.author.avatar || '/default-avatar.png'}
              alt={post.author.username}
              className="w-10 h-10 rounded-full mr-4"
            />
            <div>
              <h3 className="font-semibold">{post.author.username}</h3>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">{post.title}</h2>
          <p className="text-gray-700 mb-4">{post.content}</p>
          {post.hashtags && <HashtagList hashtags={post.hashtags} className="mb-4" />}
          <div className="flex items-center space-x-4 text-gray-500">
            <button className="flex items-center space-x-1">
              <span>❤️</span>
              <span>{post.likes_count}</span>
            </button>
            <button className="flex items-center space-x-1">
              <span>💬</span>
              <span>{post.comments_count}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList; 