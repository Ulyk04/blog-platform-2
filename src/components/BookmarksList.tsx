import React from 'react';
import { useBookmarks } from '../context/BookmarksContext';
import Post from './Post';

const BookmarksList: React.FC = () => {
  const { bookmarks } = useBookmarks();

  return (
    <div className="bookmarks-list">
      <h2>Saved Posts</h2>
      {bookmarks.length === 0 ? (
        <p>No saved posts yet</p>
      ) : (
        bookmarks.map(post => (
          <Post
            key={post.id}
            id={post.id}
            title={post.title}
            content={post.content}
          />
        ))
      )}
    </div>
  );
};

export default BookmarksList; 