import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers'; // Import combined reducers

const isProduction = process.env.NODE_ENV === 'production';

// Create the Redux store with middleware and DevTools enabled only in development
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(), // Optional: Add custom middlewares here
  devTools: !isProduction,
});

export default store;
