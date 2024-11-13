import history from '../services/history';
import store from '../redux/store'; // Make sure this path is correct for your Redux store
import { logout } from '../redux/slices/authSlice'; // Adjust the path according to your project structure

const TOKEN_TIMEOUT = 45 * 60 * 1000; // 45 minutes
let timeout;

const handleTimeout = () => {
  store.dispatch(logout()); // Dispatching logout action to clear the user state
  clearTimeout(timeout); // Clear the timeout to clean up
  history.push('/timeout');
  window.removeEventListener('mousemove', handleActivity);
  window.removeEventListener('keypress', handleActivity);
  window.removeEventListener('click', handleActivity);
  window.removeEventListener('scroll', handleActivity);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
};

const resetTimeout = () => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(handleTimeout, TOKEN_TIMEOUT);
};

const handleActivity = () => resetTimeout();

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    resetTimeout();
  }
};

const setupInactivityTimeout = () => {
  // Initialize the timeout when the page loads
  resetTimeout();

  // Event listeners for detecting user activity
  window.addEventListener('mousemove', handleActivity);
  window.addEventListener('keypress', handleActivity);
  window.addEventListener('click', handleActivity);
  window.addEventListener('scroll', handleActivity);

  // Event listener for page visibility change
  document.addEventListener('visibilitychange', handleVisibilityChange);
};

export default setupInactivityTimeout;
