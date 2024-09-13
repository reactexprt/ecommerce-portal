import React from 'react';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import store from './redux/store';
import App from './App';
import './index.css';

if (process.env.NODE_ENV === 'production') {
  // Remove React DevTools in production
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    for (const [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => {} : null;
    }
  }
}

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
})
.catch(error => {
    console.error('Error loading React DOM:', error);
});
