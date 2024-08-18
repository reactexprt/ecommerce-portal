import axios from 'axios';
import history from './history';
import store from '../redux/store';
import { logout, loginSuccess } from '../redux/actions/authActions';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

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

      // Check if the error is related to an expired token
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const { userId } = store.getState().auth; 
          const { data } = await axios.post(`${API_URL}/users/token`, { refreshToken });

          // Save new token in local storage
          localStorage.setItem('token', data.accessToken);
          store.dispatch(loginSuccess(data.accessToken, userId));

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          store.dispatch(logout());
          history.push('/login');
          history.go(0);
        }
      }

      // if (errorMessage === "Invalid token") {
      //   store.dispatch(logout());
      //   history.push('/login');
      //   history.go(0);
      // }
    } else {
      // If no response (e.g., server is down), navigate to the technical error page
      history.push('/technicalError');
      // history.go(0);
    }
    return Promise.reject(error);
  }
);

export default api;
