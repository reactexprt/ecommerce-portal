import api from '../../services/api';
import { LOGIN_SUCCESS, LOGOUT, CLEAR_CART } from '../constants/cartConstants';

export const loginSuccess = (token, userId) => ({
  type: LOGIN_SUCCESS,
  payload: { token, userId }
});

export const logout = () => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const { token, userId } = auth;
    await api.post('/users/logout', { userId }, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    // Clear tokens from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch({ type: CLEAR_CART });
    dispatch({ type: LOGOUT });
  } catch (error) {
    console.error('Logout error:');
  }
};


export const login = (token, refreshToken, userId) => async dispatch => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    dispatch(loginSuccess(token, userId));
  } catch (error) {
    console.error('Login error:', error);
    // Handle error, maybe dispatch an error action
  }
};
