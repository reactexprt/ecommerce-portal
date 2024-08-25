import { LOGIN_SUCCESS, LOGOUT } from '../constants/cartConstants';

const initialState = {
  isAuthenticated: !!localStorage.getItem('token') || false,
  token: localStorage.getItem('token') || null,
  userId: null
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        userId: action.payload.userId
      };
    case LOGOUT:
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return {
        isAuthenticated: false,
        token: null,
        userId: null,
      };
    default:
      return state;
  }
}
