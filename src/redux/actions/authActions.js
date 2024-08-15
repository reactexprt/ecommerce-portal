// src/redux/actions/authActions.js
import api from '../../services/api'
import { updateCart } from './cartActions';

export const loginSuccess = (token) => ({
  type: 'LOGIN_SUCCESS',
  payload: { token }
});

export const logout = () => {
  return (dispatch) => {
    dispatch({ type: 'LOGOUT' });
  };
};

export const login = (token) => async dispatch => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Login error:', error);
    // Handle error, maybe dispatch an error action
  }
};
