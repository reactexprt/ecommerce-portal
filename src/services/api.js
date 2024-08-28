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

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// Retry failed requests
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
          const { userId } = store.getState().auth;
          const { data } = await retryRequest(
            {
              method: 'post',
              url: `${API_URL}/users/token`,
              withCredentials: true
            },
            3,
            1000
          );

          localStorage.setItem('token', data.accessToken);
          store.dispatch(loginSuccess(data.accessToken, userId));

          isRefreshing = false;
          onTokenRefreshed(data.accessToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          store.dispatch(logout());
          alert("Your session has expired. Please log in again.");
          history.push('/login');
          // return Promise.reject(refreshError);
        }
      } else if (errorMessage === "Invalid token" || errorMessage === "Unauthorized access" || error.response.status === 403) {
        store.dispatch(logout());
        history.push('/login');
        // return Promise.reject(new Error("Session expired, please log in again"));
      } else {
        history.push('/technicalError');
        // return Promise.reject(new Error("An unknown error occurred"));
      }
    } else if (!error.response && !originalRequest._networkRetry) {
      originalRequest._networkRetry = originalRequest._networkRetry || 0;

      if (originalRequest._networkRetry < 3) {
        originalRequest._networkRetry += 1;
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, originalRequest._networkRetry))); // Exponential backoff
        return api(originalRequest); // Retry the request
      } else {
        return Promise.reject(new Error("Network error, please try again"));
      }
    } else {
      history.push('/technicalError');
      return Promise.reject(new Error("An unknown error occurred"));
    }
  }
);

export default api;
