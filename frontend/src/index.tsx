import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import theme from './theme'; // если есть кастомная тема
import './index.css'; // глобальные стили

const queryClient = new QueryClient();

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" style={{ padding: 32 }}>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);