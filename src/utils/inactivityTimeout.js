import history from '../services/history'; // Ensure you have a custom history object
import store from '../redux/store'; // import your redux store
import { logout } from '../redux/actions/authActions';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

let timeout;

const resetTimeout = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    // localStorage.removeItem('token');
    store.dispatch(logout());
    history.push('/timeout');
    // window.location.reload(); // Reload to ensure the redirection works
    history.go(0);
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
