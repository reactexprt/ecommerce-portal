import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

const isProduction = process.env.NODE_ENV === 'production';

// Create the Redux store with middleware and DevTools enabled only in development
const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(), // Optional: Add custom middlewares here
  devTools: !isProduction,
});

export default store;
