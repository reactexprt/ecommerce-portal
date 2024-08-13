import history from '../services/history';
import store from '../redux/store';
import { logout } from '../redux/actions/authActions';

const TOKEN_TIMEOUT = 45 * 60 * 1000;

// Not matter if inactive or not we will time it out after 45 minutes once the page loads
const handleTimeout = () => {
  store.dispatch(logout());
  history.push('/timeout');
  history.go(0);
};

const setupInactivityTimeout = () => {
  setTimeout(handleTimeout, TOKEN_TIMEOUT);
};

export default setupInactivityTimeout;

