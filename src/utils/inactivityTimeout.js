import history from '../services/history'; // Ensure you have a custom history object

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

let timeout;

const resetTimeout = (dispatch) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    // Dispatch LOGOUT action to update isAuthenticated state
    dispatch({ type: 'LOGOUT' });
    history.push('/timeout');
    window.location.reload(); // Reload to ensure the redirection works
  }, INACTIVITY_TIMEOUT);
};

const setupInactivityTimeout = (dispatch) => {
  window.addEventListener('mousemove', resetTimeout(dispatch));
  window.addEventListener('keydown', resetTimeout(dispatch));
  window.addEventListener('scroll', resetTimeout(dispatch));
  window.addEventListener('click', resetTimeout(dispatch));

  resetTimeout(dispatch);
};

export default setupInactivityTimeout;
