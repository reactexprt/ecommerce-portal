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
let refreshSubscribers = [];
let hasLoggedOut = false;

function onRefreshed(token) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

function forceLogout() {
  if (!hasLoggedOut) {
    hasLoggedOut = true; // Set the flag to prevent multiple alerts
    store.dispatch(logout());
    localStorage.removeItem('token');
    alert("Your session has expired. Please log in again.");
    history.push('/login');
  }
}

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

    if (error.response.status === 403) {
      console.error('403 Forbidden - Invalid or expired refresh token.');
      forceLogout();
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await api.post('/users/token');
          const appAccessToken = response?.data?.accessToken;

          store.dispatch(loginSuccess(appAccessToken, response.data.userId));
          localStorage.setItem('token', appAccessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${appAccessToken}`;

          onRefreshed(appAccessToken);
          isRefreshing = false;

          return new Promise((resolve, reject) => {
            if (appAccessToken instanceof Error) {
              reject(appAccessToken);
            } else {
              originalRequest.headers['Authorization'] = `Bearer ${appAccessToken}`;
              resolve(api(originalRequest));
            }
          });
        } catch (refreshError) {
          isRefreshing = false;
          forceLogout();
          return Promise.reject(refreshError);
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
