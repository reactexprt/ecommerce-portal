const initialState = {
  isAuthenticated: !!localStorage.getItem('token') || false,
  token: localStorage.getItem('token') || null
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        isAuthenticated: false,
        token: null,
      };
    default:
      return state;
  }
}