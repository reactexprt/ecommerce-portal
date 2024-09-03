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
let hasLoggedOut = false; // Flag to prevent multiple alerts

function onRefreshed(token) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

function forceLogout() {
  if (!hasLoggedOut) {
    hasLoggedOut = true; // Set the flag to prevent multiple alerts
    store.dispatch(logout());
    localStorage.removeItem('token');
    alert("Your session has expired. Please log in again.");
    history.push('/login');
    window.location.reload(); // Optional: force reload to clean application state
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

    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Handle 401 Unauthorized
        if (!originalRequest._retry) {
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

              return api(originalRequest);
            } catch (refreshError) {
              isRefreshing = false;
              forceLogout();  // Force logout on failed refresh
              return Promise.reject(refreshError);
            }
          } else {
            return new Promise((resolve, reject) => {
              addRefreshSubscriber(token => {
                if (token instanceof Error) {
                  reject(token);
                } else {
                  originalRequest.headers['Authorization'] = `Bearer ${token}`;
                  resolve(api(originalRequest));
                }
              });
            });
          }
        } else {
          forceLogout();  // Force logout if retry fails
        }
      } else if (status === 403) {
        // Handle 403 Forbidden
        forceLogout();  // Force logout on forbidden access
      }
    }

    return Promise.reject(error);
  }
);

export default api;
