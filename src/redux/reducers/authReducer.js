const initialState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: null,
  token: localStorage.getItem('token') || null,
};

try {
  const storedUser = localStorage.getItem('user');
  initialState.user = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
} catch (error) {
  console.error("Error parsing stored user data:", error);
  initialState.user = null;
}

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    default:
      return state;
  }
}