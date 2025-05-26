import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Post } from '../types';
import { PostList } from '../components/PostList';

export const HashtagPage: React.FC = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostsByHashtag = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/hashtag/${hashtag}`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (hashtag) {
      fetchPostsByHashtag();
    }
  }, [hashtag]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Posts tagged with #{hashtag}</h1>
      <PostList posts={posts} />
    </div>
  );
};

export default HashtagPage; 