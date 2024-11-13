import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';
import { clearCart } from './cartSlice'; // Import the clearCart action from cartSlice

// Initial state for authentication
const initialState = {
    isAuthenticated: !!localStorage.getItem('token') || false,
    token: localStorage.getItem('token') || null,
    userId: null,
};

// Create a slice for auth
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Login success action and reducer
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.token = action.payload.token;
            state.userId = action.payload.userId;
        },
        // Logout success action and reducer
        logoutSuccess: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.userId = null;
        },
    },
});

// Export the auto-generated actions
export const { loginSuccess, logoutSuccess } = authSlice.actions;

// Thunk for login (async action)
export const login = (token, userId) => async (dispatch) => {
    try {
        localStorage.setItem('token', token);
        dispatch(loginSuccess({ token, userId }));
    } catch (error) {
        console.error('Login error:', error);
    }
};

// Thunk for logout (async action)
export const logout = () => async (dispatch, getState) => {
    const { auth } = getState();
    const { token, userId } = auth;

    // Clear state and local storage immediately
    dispatch(logoutSuccess());
    dispatch(clearCart());
    localStorage.removeItem('token');

    try {
        // Continue with the API logout request in the background
        await api.post('/users/logout', { userId }, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Export the reducer to be used in store configuration
export default authSlice.reducer;
