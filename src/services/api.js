import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom/client';
import history from './history';
import store from '../redux/store';
import { logout, loginSuccess } from '../redux/actions/authActions';
import Popup from '../utils/alert/Popup';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];
let hasLoggedOut = false;
const MAX_RETRIES = 1; // Limit the number of retries
let popUpRoot = null;

// Subscribe to token refresh event
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

// Notify all subscribers once token is refreshed
function onRefreshed(token) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Reset state after logout
function resetLogoutFlags() {
  refreshSubscribers = [];
  hasLoggedOut = false;
  isRefreshing = false;
}

// Helper function to create or get the root for the pop-up
function getOrCreatePopUpRoot() {
  if (!popUpRoot) {
    let popupElement = document.getElementById('popup-root');
    if (!popupElement) {
      popupElement = document.createElement('div');
      popupElement.id = 'popup-root';
      document.body.appendChild(popupElement);
    }
    popUpRoot = ReactDOM.createRoot(popupElement); // Create root for React 18
  }
  return popUpRoot;
}

const setShowPopUp = (value) => {
  renderPopUp(value);
};

const closePopup = () => {
  setShowPopUp(false);
  history.push('/login');
  resetLogoutFlags();
  if (popUpRoot) {
    popUpRoot.unmount();
    popUpRoot = null;
  }
};

function renderPopUp(showPopUp) {
  const root = getOrCreatePopUpRoot();
  if (showPopUp) {
    root.render(
      <Popup
        message="Your session has expired. Please log in again."
        onClose={closePopup}
      />
    );
  } else if (popUpRoot) {
    popUpRoot.unmount();
    popUpRoot = null;
  }
}

function forceLogout() {
  if (!hasLoggedOut) {
    hasLoggedOut = true;
    store.dispatch(logout());
    localStorage.removeItem('token');
    setShowPopUp(true);
  }
}

// Axios interceptors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Avoid attaching a token to the logout request or triggering unnecessary logout loops
    if (token && !config.url.endsWith('/logout') && !config.url.endsWith('/users/token')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 403 Forbidden response, indicating invalid or expired refresh token
    if (error.response?.status === 403 && !originalRequest.url.endsWith('/logout')) {
      console.error('403 Forbidden - Invalid or expired refresh token.');
      forceLogout();
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized response (token expiration), skip if it's for logout
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.endsWith('/logout')) {
      originalRequest._retry = true;
      originalRequest._retryCount = originalRequest._retryCount || 0;

      // Prevent multiple refreshes at once
      if (originalRequest._retryCount >= MAX_RETRIES) {
        return Promise.reject(new Error('Max retries reached for this request.'));
      }

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await api.post('/users/token');
          const newAccessToken = response?.data?.accessToken;

          store.dispatch(loginSuccess(newAccessToken, response.data.userId));
          localStorage.setItem('token', newAccessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

          onRefreshed(newAccessToken); // Notify subscribers with the new token
          isRefreshing = false;

          // Retry the original request with the new token
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          forceLogout(); // Trigger forceLogout on token refresh failure
          return Promise.reject(refreshError);
        }
      } else {
        // Queue the request until the token is refreshed
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(api(originalRequest)); // Retry the original request with the new token
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
