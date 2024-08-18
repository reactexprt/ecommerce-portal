import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import ForgotPasswordModal from '../../components/forgotPassword/ForgotPasswordModal';
import { login } from '../../redux/actions/authActions';
import GoogleSignIn from '../../components/GoogleSignIn';
import './Login.css';

// Import WebAuthn library
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt to retrieve email from cookies using a utility function or manually
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    if (!!getCookie('userEmail')) {
      const storedEmail = decodeURIComponent(getCookie('userEmail')).trim();
      setEmail(storedEmail);
      // Check if the user has enabled biometric login
      const checkBiometricStatus = async () => {
        try {
          const response = await api.get(`/users/biometric-status`, { params: { email: storedEmail } });
          if (response.data.biometricEnabled) {
            setBiometricEnabled(true);
          }
        } catch (err) {
          console.error('Error checking biometric status:');
        }
      };

      checkBiometricStatus();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login', { email, password });
      dispatch(login(response.data.token, response.data.refreshToken, response.data.userId));

      // Check if biometric login is enabled and prompt if not
      const biometricStatusResponse = await api.get(`/users/biometric-status`, { params: { email } });
      if (!biometricStatusResponse.data.biometricEnabled && window.confirm('Would you like to enable biometric login for future logins?')) {
        try {
          const optionsResponse = await api.post('/webauthn/registration-options', { email });
          const attestationResponse = await startRegistration(optionsResponse.data);
          await api.post('/webauthn/register', { email, credential: attestationResponse });
          alert('Biometric registration successful!');
        } catch (error) {
          console.error('Error during WebAuthn registration:', error);
          alert('Biometric registration failed. Please try again later.');
        }
      }

      navigate('/products');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(errorMessage);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      // Ensure email is available
      if (!email) {
        return setError('Email is required for biometric login. Please log in using your password first.');
      }
      const optionsResponse = await api.post('/webauthn/authentication-options', { email });
      const authResponse = await startAuthentication(optionsResponse.data);
      const verificationResponse = await api.post('/webauthn/verify-authentication', {
        email,
        credential: authResponse
      });

      dispatch(login(verificationResponse.data.token, verificationResponse.data.refreshToken, verificationResponse.data.userId));
      navigate('/products');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Biometric authentication failed. Please try again.';
      setError(errorMessage);
    }
  };

  const handleForgotPasswordClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Login - Himalayan Rasa</title>
      </Helmet>
      <div className="login-page">
        <h2>LOGIN</h2>
        {error && <p className="error">{error}</p>}

        {/* Biometric Login Button */}
        {biometricEnabled && (
          <button onClick={handleBiometricLogin} className="biometric-login-btn">
            Login with Face ID / Fingerprint
          </button>
        )}

        {/* Traditional Login Form */}
        <form onSubmit={handleLogin}>
          <div>
            <label>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">LOGIN</button>
        </form>

        {/* Google Sign-In Button */}
        <div className="google-signin-container">
          <GoogleSignIn />
        </div>

        <div className="login-footer">
          <button className="btn-link forgot-password" onClick={handleForgotPasswordClick}>
            FORGOT PASSWORD?
          </button>
          <button className="btn-link new-user" onClick={() => navigate('/register')}>
            NEW USER? REGISTER
          </button>
        </div>

        {isModalOpen && (
          <ForgotPasswordModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            setLoginEmail={setEmail}
            setLoginPassword={setPassword}
          />
        )}
      </div>
    </>
  );
};

export default Login;
