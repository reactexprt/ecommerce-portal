import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LogRocket from 'logrocket';
import { login } from '../redux/actions/authActions';
import api from '../services/api';

const GoogleSignIn = ({ setLoading }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    setLoading(true);
    try {
      const { credential } = response;

      // Send the token to your backend for verification or user creation
      const result = await api.post('/auth/google', { token: credential });
      const { authToken, userId, username, email } = result.data;
      // Dispatch an action to set the user in your Redux store
      // dispatch({ type: 'LOGIN_SUCCESS', payload: { token: authToken, userId: userId } });
      dispatch(login(authToken, userId));

      if (process.env.NODE_ENV === 'production') {
        try {
          LogRocket.startNewSession();
          LogRocket.identify(userId, {
            name: username,
            email: email
          });
        } catch (error) {
          console.error('Error initializing LogRocket session:', error);
          // Optionally, log the error to LogRocket as well
          LogRocket.captureException(error);
        }
      }

      navigate('/cart');

    } catch (error) {
      console.error('Google Sign-In Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    console.error('Google Sign-In failed.');
    setLoading(false);
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
