import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom/client';
import history from './history';
import store from '../redux/store';
import { logout, loginSuccess } from '../redux/actions/authActions';
import Popup from '../utils/alert/Popup'; // Import the Popup component

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];
let hasLoggedOut = false;
const MAX_RETRIES = 1; // Limit the number of retries
// Create a small state management for popup visibility
let popUpRoot = null;

// Helper to subscribe to token refresh event
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

// Notify all subscribers once token is refreshed
function onRefreshed(token) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Reset the logout flag
function resetLogoutFlags() {
  refreshSubscribers = [];
  hasLoggedOut = false;
  popUpRoot = null;
  isRefreshing = false;
}

// Helper function to create or get the root for the pop-up
function getOrCreatePopUpRoot() {
  if (!popUpRoot) {
    let popupElement = document.getElementById('popup-root');
    
    // Create a new root if it doesn't exist
    if (!popupElement) {
      popupElement = document.createElement('div');
      popupElement.id = 'popup-root';
      document.body.appendChild(popupElement);
    }
    
    popUpRoot = ReactDOM.createRoot(popupElement); // Create root for React 18
  }
  return popUpRoot;
}

// Function to update pop-up state and render accordingly
const setShowPopUp = (value) => {
  renderPopUp(value);
};

const closePopup = () => {
    setShowPopUp(false);
    history.push('/login');
    resetLogoutFlags();
};

// Function to render the pop-up using ReactDOM
function renderPopUp(showPopUp) {
  const root = getOrCreatePopUpRoot();

  if (showPopUp) {
    root.render(
      <Popup
        message="Your session has expired. Please log in again."
        onClose={closePopup}
      />
    );
  } else {
    root.unmount(); // Unmount the pop-up when closed
  }
}

// Force user logout and display the popup
function forceLogout() {
  if (!hasLoggedOut) {
    hasLoggedOut = true; // Prevent multiple alerts
    store.dispatch(logout());
    localStorage.removeItem('token');
    setShowPopUp(true); // Show the pop-up instead of alert
  }
}


// Axios interceptors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
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

    // If 403 error (Forbidden)
    if (error.response?.status === 403) {
      console.error('403 Forbidden - Invalid or expired refresh token.');
      forceLogout();
      return Promise.reject(error);
    }

    // If 401 error (Unauthorized) and request hasn't retried yet, and below max retries
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = originalRequest._retryCount || 0;

      // Check if the request has exceeded the maximum retry limit
      if (originalRequest._retryCount >= MAX_RETRIES) {
        return Promise.reject(new Error('Max retries reached for this request.'));
      }

      originalRequest._retryCount += 1;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await api.post('/users/token');
          const appAccessToken = response?.data?.accessToken;

          store.dispatch(loginSuccess(appAccessToken, response.data.userId));
          localStorage.setItem('token', appAccessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${appAccessToken}`;

          // Notify all subscribers with the new token
          onRefreshed(appAccessToken);

          isRefreshing = false;

          // Retry the original request with the new token
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          forceLogout();  // Trigger forceLogout on token refresh failure
          return Promise.reject(refreshError);
        }
      } else {
        // Add all failed requests to the queue and retry them once the token is refreshed
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
