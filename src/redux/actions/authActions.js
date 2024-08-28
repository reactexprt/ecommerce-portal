import api from '../../services/api';
import { LOGIN_SUCCESS, LOGOUT, CLEAR_CART } from '../constants/cartConstants';

export const loginSuccess = (token, userId) => ({
  type: LOGIN_SUCCESS,
  payload: { token, userId }
});

export const logout = () => async (dispatch, getState) => {
  const { auth } = getState();
  const { token, userId } = auth;
  // Attempt to notify the server about the logout
  api.post('/users/logout', { userId }, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  }).catch(error => {
    console.error('Logout error:', error);
    // This catch is just to log the error; the logout proceeds regardless
  }).finally(() => {
    // Always clear the client state, regardless of server response
    localStorage.removeItem('token');
    dispatch({ type: CLEAR_CART });
    dispatch({ type: LOGOUT });
  });
};

export const login = (token, userId) => async dispatch => {
  try {
    localStorage.setItem('token', token);
    dispatch(loginSuccess(token, userId));
  } catch (error) {
    console.error('Login error:', error);
    // Handle error, maybe dispatch an error action
  }
};
