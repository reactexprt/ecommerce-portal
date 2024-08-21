import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import ForgotPasswordModal from '../../components/forgotPassword/ForgotPasswordModal';
import { login } from '../../redux/actions/authActions';
import GoogleSignIn from '../../components/GoogleSignIn';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import ContactUsButton from '../../components/contactUs/ContactUsButton';

// Import Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint, faLock, faShieldAlt, faQuoteLeft, faQuoteRight, faHeadset } from '@fortawesome/free-solid-svg-icons';

import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const emailRef = useRef(null);  // Create a ref for the email input
  const biometricBtnRef = useRef(null); // Create a ref for the biometric login button
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const storedEmail = getCookie('userEmail') ? decodeURIComponent(getCookie('userEmail')).trim() : '';
    
    if (storedEmail) {
      setEmail(storedEmail);

      // Check if the user has enabled biometric login
      const checkBiometricStatus = async () => {
        try {
          const response = await api.get(`/users/biometric-status`, { params: { email: storedEmail } });
          if (response.data.biometricEnabled) {
            setBiometricEnabled(true);
            if (biometricBtnRef.current) {
              biometricBtnRef.current.focus(); // Focus the biometric button if enabled
              biometricBtnRef.current.click(); // Simulate a click on the biometric button
            }
          } else {
            if (emailRef.current) {
              emailRef.current.focus(); // Focus the email input if biometric is not enabled
            }
          }
        } catch (err) {
          console.error('Error checking biometric status:', err);
          if (emailRef.current) {
            emailRef.current.focus(); // Fallback to focusing the email input in case of an error
          }
        }
      };

      checkBiometricStatus();
    } else {
      if (emailRef.current) {
        emailRef.current.focus(); // Focus the email input if no stored email
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login', { email, password });
      dispatch(login(response.data.token, response.data.refreshToken, response.data.userId));

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
        <title>Ľogin - Ħimalayan R̥asa</title>
      </Helmet>
      <div className="login-page">
        <h2>LOGIN</h2>
        {error && <p className="error">{error}</p>}

        {biometricEnabled && (
          <button onClick={handleBiometricLogin} ref={biometricBtnRef} className="biometric-login-btn">
            <FontAwesomeIcon icon={faFingerprint} /> Login with Face ID / Fingerprint
          </button>
        )}

        <form onSubmit={handleLogin}>
          <div>
            <label>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              ref={emailRef} // Assign ref to the email input
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

        <div className="trust-badges">
          <FontAwesomeIcon icon={faLock} /> Secure Checkout
          <FontAwesomeIcon icon={faShieldAlt} /> Protected by SSL
        </div>

        <div className="testimonials">
          <FontAwesomeIcon icon={faQuoteLeft} /> Himalayan Rasa has changed my life for the better. The best service ever! <FontAwesomeIcon icon={faQuoteRight} />
          <p>- Abhinav Narchal</p>
        </div>

        <div className="login-contact-info">
          <FontAwesomeIcon icon={faHeadset} /> Need Help? <a href="/support">Contact Us</a>
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
