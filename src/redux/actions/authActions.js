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
  };
};

export const login = (user, token) => async dispatch => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    // Fetch user cart after successful login
    const cartResponse = await api.get('/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
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
