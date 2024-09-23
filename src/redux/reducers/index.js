import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authReducer';
import cartReducer from './cartReducer';

// Combine all reducers into a single root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer
});

export default rootReducer;