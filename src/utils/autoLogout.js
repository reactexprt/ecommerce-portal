// src/utils/autoLogout.js
import store from '../redux/store'; // import your redux store
import { logout } from '../redux/actions/authActions';

let logoutTimer;

const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

const resetTimer = () => {
  clearTimeout(logoutTimer);
  startTimer();
};

const startTimer = () => {
  logoutTimer = setTimeout(() => {
    store.dispatch(logout());
    alert('You have been logged out due to inactivity.');
  }, AUTO_LOGOUT_TIME);
};

const initAutoLogout = () => {
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keydown', resetTimer);
  startTimer();
};

const clearAutoLogout = () => {
  clearTimeout(logoutTimer);
  window.removeEventListener('mousemove', resetTimer);
  window.removeEventListener('keydown', resetTimer);
};

export { initAutoLogout, clearAutoLogout };
