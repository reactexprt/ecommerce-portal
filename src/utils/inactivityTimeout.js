import history from '../services/history'; // Ensure you have a custom history object

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

let timeout;

const resetTimeout = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    localStorage.removeItem('token');
    history.push('/timeout');
    window.location.reload(); // Reload to ensure the redirection works
  }, INACTIVITY_TIMEOUT);
};

const setupInactivityTimeout = () => {
  window.addEventListener('mousemove', resetTimeout);
  window.addEventListener('keydown', resetTimeout);
  window.addEventListener('scroll', resetTimeout);
  window.addEventListener('click', resetTimeout);

  resetTimeout();
};

export default setupInactivityTimeout;
