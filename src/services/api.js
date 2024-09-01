import axios from 'axios';
import history from './history';
import store from '../redux/store';
import { logout, loginSuccess } from '../redux/actions/authActions';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

let isRefreshing = false;
let hasLoggedOut = false; // Flag to ensure logout is only processed once

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token && !config.url.endsWith('/logout')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true; // Mark the original request to prevent loops

        try {
          const response = await api.post('/users/token');

          store.dispatch(loginSuccess(response.data.accessToken, response.data.userId));
          localStorage.setItem('token', response.data.accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;

          isRefreshing = false; // Reset the refreshing flag after successful refresh
          return api(originalRequest); // Retry the original request with the new token
        } catch (refreshError) {
          isRefreshing = false;
          if (!hasLoggedOut) {
            hasLoggedOut = true; // Set the logged out flag
            store.dispatch(logout());
            localStorage.removeItem('token');
            alert("Your session has expired. Please log in again.");
            history.push('/login');
            window.location.reload(); // Optional: force reload to clean application state
          }
          return Promise.reject(refreshError); // Reject the promise to stop further processing
        }
      } else {
        return new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error("Login session expired, please log in again.")), 500); // Add a delay to handle concurrent requests
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
