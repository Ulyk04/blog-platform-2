import React from 'react';
import { useBookmarks } from '../context/BookmarksContext';

interface PostProps {
  id: number;
  title: string;
  content: string;
}

const Post: React.FC<PostProps> = ({ id, title, content }) => {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const bookmarked = isBookmarked(id);

  const handleBookmarkClick = () => {
    if (bookmarked) {
      removeBookmark(id);
    } else {
      addBookmark({ id, title, content });
    }
  };

  return (
    <div className="post">
      <h2>{title}</h2>
      <p>{content}</p>
      <button 
        onClick={handleBookmarkClick}
        className={`bookmark-button ${bookmarked ? 'bookmarked' : ''}`}
      >
        {bookmarked ? '★' : '☆'}
      </button>
    </div>
  );
};

export default Post; 