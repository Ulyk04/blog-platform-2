import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { BookmarksProvider } from './context/BookmarksContext';
import ThemeToggle from './components/ThemeToggle';
import Post from './components/Post';
import BookmarksList from './components/BookmarksList';
import './App.css';

// Пример постов
const samplePosts = [
  {
    id: 1,
    title: "First Post",
    content: "This is the content of the first post."
  },
  {
    id: 2,
    title: "Second Post",
    content: "This is the content of the second post."
  },
  {
    id: 3,
    title: "Third Post",
    content: "This is the content of the third post."
  }
];

function App() {
  const [showBookmarks, setShowBookmarks] = useState(false);

  return (
    <ThemeProvider>
      <BookmarksProvider>
        <div className="App">
          <header className="App-header">
            <ThemeToggle />
            <button 
              className="bookmarks-toggle"
              onClick={() => setShowBookmarks(!showBookmarks)}
            >
              {showBookmarks ? 'Show Posts' : 'Show Bookmarks'}
            </button>
            
            {showBookmarks ? (
              <BookmarksList />
            ) : (
              <div className="posts-list">
                <h1>Posts</h1>
                {samplePosts.map(post => (
                  <Post
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                  />
                ))}
              </div>
            )}
          </header>
        </div>
      </BookmarksProvider>
    </ThemeProvider>
  );
}

export default App; 