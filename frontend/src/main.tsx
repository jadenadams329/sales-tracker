// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import  { configureStore } from './store';
import { restoreCSRF, csrfFetch } from './store/csrf';

// Create store instance
const store = configureStore();

// Extend window interface for TypeScript
declare global {
  interface Window {
    csrfFetch?: typeof csrfFetch;
    store?: ReturnType<typeof configureStore>;
  }
}

// Handle CSRF restoration and window assignments in development
if (import.meta.env.MODE !== 'production') {
  restoreCSRF(); 

  window.csrfFetch = csrfFetch;
  window.store = store;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);