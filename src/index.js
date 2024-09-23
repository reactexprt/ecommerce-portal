import React from 'react';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import store from './redux/store';
import App from './App';
import './index.css';

// Dynamically import `createRoot` from `react-dom/client`
import(/* webpackChunkName: "react-dom" */ 'react-dom/client')
  .then(({ createRoot }) => {
    const container = document.getElementById('root');
    const root = createRoot(container);

    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </Provider>
      </React.StrictMode>
    );

    // Register the service worker only in production mode
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);

            // Optional: Add logic to check for new content and update the service worker
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('New content is available; please refresh.');
                      // Optionally, prompt user to refresh
                    } else {
                      console.log('Content is cached for offline use.');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error('Error during service worker registration:', error);
          });
      });
    }
  })
  .catch((error) => {
    console.error('Error loading React DOM:', error);
  });
