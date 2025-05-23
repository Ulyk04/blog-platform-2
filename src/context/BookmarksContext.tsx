import React, { createContext, useContext, useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
}

interface BookmarksContextType {
  bookmarks: Post[];
  addBookmark: (post: Post) => void;
  removeBookmark: (postId: number) => void;
  isBookmarked: (postId: number) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export const BookmarksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Post[]>(() => {
    const savedBookmarks = localStorage.getItem('bookmarks');
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (post: Post) => {
    setBookmarks(prev => [...prev, post]);
  };

  const removeBookmark = (postId: number) => {
    setBookmarks(prev => prev.filter(post => post.id !== postId));
  };

  const isBookmarked = (postId: number) => {
    return bookmarks.some(post => post.id === postId);
  };

  return (
    <BookmarksContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarksContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}; 