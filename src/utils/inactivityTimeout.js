import history from '../services/history';

const TOKEN_TIMEOUT = 45 * 60 * 1000; // 45 minutes
let timeout;

const handleTimeout = () => {
  // store.dispatch(logout());
  history.push('/timeout');
};

const resetTimeout = () => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(handleTimeout, TOKEN_TIMEOUT);
};

const setupInactivityTimeout = () => {
  // Reset the timeout on user interaction
  const handleActivity = () => resetTimeout();

  // Reset the timeout if the page becomes active again
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      resetTimeout();
    }
  };

  // Event listeners for detecting user activity
  window.addEventListener('mousemove', handleActivity);
  window.addEventListener('keypress', handleActivity);
  window.addEventListener('click', handleActivity);
  window.addEventListener('scroll', handleActivity);

  // Event listener for page visibility change
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Initialize the timeout when the page loads
  resetTimeout();
};

export default setupInactivityTimeout;
