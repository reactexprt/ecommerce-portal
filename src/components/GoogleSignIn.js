import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/actions/authActions';
import api from '../services/api';

const GoogleSignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      const { credential } = response;

      // Send the token to your backend for verification or user creation
      const result = await api.post('/auth/google', { token: credential });
      // Assuming the backend returns both accessToken and refreshToken
      const { authToken, refreshToken, userId } = result.data;
      // Dispatch an action to set the user in your Redux store
      // dispatch({ type: 'LOGIN_SUCCESS', payload: { token: authToken, userId: userId } });
      dispatch(login(authToken, refreshToken, userId));
      navigate('/cart');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  const handleError = () => {
    console.error('Google Sign-In failed.');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        // redirectUri="http://localhost"
        scope="profile"
        // useOneTap
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleSignIn;
