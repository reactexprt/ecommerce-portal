import axios from 'axios';
import history from './history';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
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
  error => {
    if (error.response) {
      // if (error.response.status === 401 || error.response.status === 400) {
      //   localStorage.removeItem('token');
      //   history.push('/technical-error');
      //   window.location.reload();// Reload to ensure the redirection works
      // }
      // localStorage.removeItem('token');
      // history.push('/technical-error');
      // window.location.reload();
    } else {
      // If no response (e.g., server is down), navigate to the technical error page
      history.push('/technical-error');
      window.location.reload(); // Reload to ensure the redirection works
    }
    return Promise.reject(error);
  }
);

export default api;
