// src/services/api.js
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
    if (error.response 
      && (error.response.status === 401 || error.response.status === 400)) {
      // Redirect to login page on session timeout
      alert('Session has timed out, please log in again.');
      localStorage.removeItem('token');
      history.push('/login');
      window.location.reload(); // Reload to ensure the redirection works
    }
    return Promise.reject(error);
  }
);

export default api;

