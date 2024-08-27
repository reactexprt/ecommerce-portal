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
let isLoggingOut = false; // Flag to indicate logout in progress

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

const retryRequest = async (request, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios(request);
    } catch (err) {
      if (i === retries - 1 || !err.response) throw err;
      await new Promise(res => setTimeout(res, delay * Math.pow(2, i))); // Exponential backoff
    }
  }
};

api.interceptors.request.use(
  config => {
    if (isLoggingOut) {
      return Promise.reject(new Error("Logout in progress"));
    }

    const token = localStorage.getItem('token');
    if (token) {
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
      const errorMessage = error.response.data?.message || error.response.statusText;

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise(resolve => {
            addRefreshSubscriber(newToken => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const { userId } = store.getState().auth;

          const { data } = await retryRequest(
            {
              method: 'post',
              url: `${API_URL}/users/token`,
              data: { refreshToken }
            },
            3,
            1000
          );

          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          store.dispatch(loginSuccess(data.accessToken, userId));

          isRefreshing = false;
          onTokenRefreshed(data.accessToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          isLoggingOut = true; // Set the flag to prevent further requests
          store.dispatch(logout());
          localStorage.removeItem('token'); // Ensure tokens are removed
          localStorage.removeItem('refreshToken');
          alert("Your session has expired. Please log in again.");
          history.push('/login');
          return Promise.reject(refreshError);
        }
      } else if (errorMessage === "Invalid token" || errorMessage === "Unauthorized access" || error.response.status === 403) {
        isLoggingOut = true; // Set the flag to prevent further requests
        store.dispatch(logout());
        localStorage.removeItem('token'); // Ensure tokens are removed
        localStorage.removeItem('refreshToken');
        history.push('/login');
      } else {
        history.push('/technicalError');
      }
    } else if (!error.response && !originalRequest._networkRetry) {
      originalRequest._networkRetry = true;
      return retryRequest(originalRequest);
    } else {
      history.push('/technicalError');
    }

    return Promise.reject(error);
  }
);

export default api;
