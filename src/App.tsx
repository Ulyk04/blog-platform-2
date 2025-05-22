import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './App.css';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <header className="App-header">
          <ThemeToggle />
          <h1>Welcome to React</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App; 