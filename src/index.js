import React from 'react';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import store from './redux/store';
import App from './App';
import './index.css';

// Dynamically import `createRoot` from `react-dom/client`
import(/* webpackChunkName: "react-dom" */ 'react-dom/client').then(({ createRoot }) => {
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
});
