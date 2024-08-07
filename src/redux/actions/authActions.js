// src/redux/actions/authActions.js
import api from '../../services/api'
import { updateCart } from './cartActions';

export const loginSuccess = (user, token) => ({
  type: 'LOGIN_SUCCESS',
  payload: { user, token },
});

export const logout = () => {
  return (dispatch) => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
};

export const login = (email, password) => async dispatch => {
  try {
    // TODO - we are already calling it from Login.js
    const response = await api.post('/users/login', { email, password });
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.data.user, token: response.data.token } });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Fetch user cart after successful login
    const cartResponse = await api.get('/cart', {
      headers: {
        Authorization: `Bearer ${response.data.token}`,
      }
    });
    const cartItems = cartResponse.data;
    // Dispatch action to update cart in frontend
    dispatch(updateCart(cartItems));
  } catch (error) {
    console.error('Login error:', error);
    // Handle error, maybe dispatch an error action
  }
};
