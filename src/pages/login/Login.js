import React, { useState, useEffect, useRef, lazy } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LogRocket from 'logrocket';
import api from '../../services/api';
import ForgotPasswordModal from '../../components/forgotPassword/ForgotPasswordModal';
import { login } from '../../redux/actions/authActions';
import GoogleSignIn from '../../components/GoogleSignIn';
import FacebookSignin from '../../components/FacebookSignin';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
const Popup = lazy(() => import('../../utils/alert/Popup')); // Importing Popup component

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSignInAlt, faKey, faUserPlus, faFingerprint, faLock, faShieldAlt, faQuoteLeft, faQuoteRight, faHeadset } from '@fortawesome/free-solid-svg-icons';

import './Login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Updated to handle either email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false); // State for general popups
  const [popupMessage, setPopupMessage] = useState(''); // State to hold popup message
  const [showConfirm, setShowConfirm] = useState(false); // State for confirm popup
  const identifierRef = useRef(null); // Ref for email/username input
  const biometricBtnRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const storedIdentifier = getCookie('userIdentifier') ? decodeURIComponent(getCookie('userIdentifier')).trim() : '';

    if (storedIdentifier) {
      setIdentifier(storedIdentifier);

      const checkBiometricStatus = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/users/biometric-status`, { params: { identifier: storedIdentifier } });
          if (response.data.biometricEnabled) {
            setBiometricEnabled(true);
          } else {
            identifierRef.current?.focus(); // Focus the input if biometric is not enabled
          }
        } catch (err) {
          console.error('Error checking biometric status:', err);
          identifierRef.current?.focus(); // Fallback to focusing the input in case of an error
        } finally {
          setLoading(false);
        }
      };

      checkBiometricStatus();
    } else {
      identifierRef.current?.focus(); // Focus the input if no stored identifier
    }
  }, []);

  useEffect(() => {
    if (biometricEnabled && biometricBtnRef.current) {
      biometricBtnRef.current.focus(); // Focus the biometric button
      biometricBtnRef.current.click(); // Simulate a click on the biometric button
    }
  }, [biometricEnabled]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/users/login', { identifier, password }); // Use identifier instead of email
      dispatch(login(response.data.token, response.data.userId));

      if (process.env.NODE_ENV === 'production') {
        try {
          LogRocket.startNewSession();
          LogRocket.identify(response.data.userId, {
            name: response.data.username,
            email: response.data.email
          });
        } catch (error) {
          console.error('Error initializing LogRocket session:', error);
          // Optionally, log the error to LogRocket as well
          LogRocket.captureException(error);
        }
      }

      const biometricStatusResponse = await api.get(`/users/biometric-status`, { params: { identifier } });
      setIsLoggedin(true);

      if (!biometricStatusResponse.data.biometricEnabled) {
        setShowConfirm(true); // Show confirmation popup
      } else {
        navigate('/cart');
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid email/username or password. Please try again. 🔑';
      setPopupMessage(`❌ ${errorMessage}`);
      setShowPopUp(true); // Show error popup
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      if (!identifier) {
        setPopupMessage('🔒 Whoops! You need to enter your Email or Username for biometric login. Try logging in with your password first! 🔑');
        setShowPopUp(true); // Show popup for missing identifier
        return;
      }
      const optionsResponse = await api.post('/webauthn/authentication-options', { identifier });
      const authResponse = await startAuthentication(optionsResponse.data);
      const verificationResponse = await api.post('/webauthn/verify-authentication', {
        identifier,
        credential: authResponse
      });

      dispatch(login(verificationResponse.data.token, verificationResponse.data.userId));

      if (process.env.NODE_ENV === 'production') {
        try {
          LogRocket.startNewSession();
          LogRocket.identify(verificationResponse.data.userId, {
            name: verificationResponse.data.username,
            email: verificationResponse.data.email
          });
        } catch (error) {
          console.error('Error initializing LogRocket session:', error);
          // Optionally, log the error to LogRocket as well
          LogRocket.captureException(error);
        }
      }

      navigate('/cart');
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Biometric authentication failed. Please try again. 🔒';
      setPopupMessage(`😕 ${errorMessage}`);
      setShowPopUp(true);
    }
  };

  const handleForgotPasswordClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = async () => {
    try {
      const optionsResponse = await api.post('/webauthn/registration-options', { identifier });
      const attestationResponse = await startRegistration(optionsResponse.data);
      await api.post('/webauthn/register', { identifier, credential: attestationResponse });
      setPopupMessage('🎉 Biometric registration successful! 👤🔒 You’re all set for Face ID or Thumbprint login! 👍✨'); // Show success message

      setShowPopUp(true); // Display success popup
    } catch (error) {
      setPopupMessage('😕 Biometric registration failed. Please try again later. 🔄');
      setShowPopUp(true); // Show failure popup
    } finally {
      setShowConfirm(false); // Close confirmation popup
      if (isLoggedin) {
        setTimeout(() => {
          navigate('/cart');
        }, 2000); // Add a delay to show the success/failure message before navigating
      }
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false); // Close confirmation popup
    if (isLoggedin) {
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
        <p>Hold tight, we're getting you in... Your adventure with the Ħimalayan R̥asa is just a click away!</p>
      </div>
    );
  }

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
            <label htmlFor='identifier'>EMAIL OR USERNAME</label> {/* Updated label */}
            <input
              id="identifier"
              type="text" // Changed to text to accept both email and username
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              ref={identifierRef} // Assign ref to the input
              required
              autoComplete='username'
            />
          </div>
          <div>
            <label htmlFor='password'>PASSWORD</label>
            <input
              id='password'
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete='current-password'
            />
          </div>
          <button className='login-forgot-password-buttons' type="submit" disabled={loading}>
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faSignInAlt} className="icon-margin" />
          )}
          Login
        </button>
        </form>

        <div className='single-sign-in-divs'>
          <div className="google-signin-container">
            <GoogleSignIn setLoading={setLoading} />
          </div>
          <div className='facebook-sigin-container'>
            <FacebookSignin setLoading={setLoading} />
          </div>
        </div>

        <div className="login-footer">
          <button className="btn-link forgot-password login-forgot-password-buttons" onClick={handleForgotPasswordClick}>
            <FontAwesomeIcon icon={faKey} className="icon-margin" /> FORGOT PASSWORD?
          </button>
          <button className="btn-link new-user login-forgot-password-buttons" onClick={() => navigate('/register')}>
            <FontAwesomeIcon icon={faUserPlus} className="icon-margin" /> NEW USER? REGISTER
          </button>
        </div>

        <div className="trust-badges">
          <FontAwesomeIcon icon={faLock} /> Secure Checkout
          <FontAwesomeIcon icon={faShieldAlt} /> Protected by SSL
        </div>

        <div className="testimonials">
          <FontAwesomeIcon icon={faQuoteLeft} /> Himalayan Rasa has changed my life for the better. The best service ever! <FontAwesomeIcon icon={faQuoteRight} />
          <p>- A Satisfied Customer</p>
        </div>

        <div className="login-contact-info">
          <FontAwesomeIcon icon={faHeadset} /> Need Help? <a href="/support">Contact Us</a>
        </div>

        {isModalOpen && (
          <ForgotPasswordModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            setLoginEmail={setIdentifier} // Updated to use identifier
            setLoginPassword={setPassword}
          />
        )}

        {showPopUp && (
          <Popup
            message={popupMessage}
            onClose={() => setShowPopUp(false)}
          />
        )}

        {showConfirm && (
          <Popup
            message="Would you like to enable biometric login for future logins?"
            onConfirm={handleConfirm}
            onCancel={handleCancelConfirm}
          />
        )}
      </div>
    </>
  );
};

export default Login;
