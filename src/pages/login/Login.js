import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import ForgotPasswordModal from '../../components/forgotPassword/ForgotPasswordModal';
import { login } from '../../redux/actions/authActions';
import GoogleSignIn from '../../components/GoogleSignIn';
import FacebookSignin from '../../components/FacebookSignin';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import Popup from '../../utils/alert/Popup'; // Importing Popup component

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faKey, faUserPlus, faFingerprint, faLock, faShieldAlt, faQuoteLeft, faQuoteRight, faHeadset } from '@fortawesome/free-solid-svg-icons';

import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false); // State for general popups
  const [popupMessage, setPopupMessage] = useState(''); // State to hold popup message
  const [showConfirm, setShowConfirm] = useState(false); // State for confirm popup
  const emailRef = useRef(null);
  const biometricBtnRef = useRef(null);
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

      const checkBiometricStatus = async () => {
        try {
          const response = await api.get(`/users/biometric-status`, { params: { email: storedEmail } });
          if (response.data.biometricEnabled) {
            setBiometricEnabled(true);
          } else {
            emailRef.current?.focus(); // Focus the email input if biometric is not enabled
          }
        } catch (err) {
          console.error('Error checking biometric status:', err);
          emailRef.current?.focus(); // Fallback to focusing the email input in case of an error
        }
      };

      checkBiometricStatus();
    } else {
      emailRef.current?.focus(); // Focus the email input if no stored email
    }
  }, []);

  useEffect(() => {
    // Separate useEffect to ensure biometricBtnRef is available before accessing
    if (biometricEnabled && biometricBtnRef.current) {
      biometricBtnRef.current.focus(); // Focus the biometric button
      biometricBtnRef.current.click(); // Simulate a click on the biometric button
    }
  }, [biometricEnabled]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login', { email, password });
      dispatch(login(response.data.token, response.data.userId));

      const biometricStatusResponse = await api.get(`/users/biometric-status`, { params: { email } });
      setIsLoggedin(true);
      if (!biometricStatusResponse.data.biometricEnabled) {
        setShowConfirm(true); // Show confirmation popup
      } else {
        navigate('/cart');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setPopupMessage(errorMessage);
      setShowPopUp(true); // Show error popup
    }
  };

  const handleBiometricLogin = async () => {
    try {
      if (!email) {
        setPopupMessage('Email is required for biometric login. Please log in using your password first.');
        setShowPopUp(true); // Show popup for missing email
        return;
      }
      const optionsResponse = await api.post('/webauthn/authentication-options', { email });
      const authResponse = await startAuthentication(optionsResponse.data);
      const verificationResponse = await api.post('/webauthn/verify-authentication', {
        email,
        credential: authResponse
      });

      dispatch(login(verificationResponse.data.token, verificationResponse.data.userId));
      navigate('/cart');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Biometric authentication failed. Please try again.';
      setPopupMessage(errorMessage); // Display error in the popup
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
      const optionsResponse = await api.post('/webauthn/registration-options', { email });
      const attestationResponse = await startRegistration(optionsResponse.data);
      await api.post('/webauthn/register', { email, credential: attestationResponse });
      setPopupMessage('Biometric registration successful!'); // Show success message

      setShowPopUp(true); // Display success popup
    } catch (error) {
      setPopupMessage('Biometric registration failed. Please try again later.');
      setShowPopUp(true); // Show failure popup
    } finally {
      setShowConfirm(false); // Close confirmation popup
      if (isLoggedin) {
        // Only navigate if login was successful
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
            <label htmlFor='email'>EMAIL</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              ref={emailRef} // Assign ref to the email input
              required
              autoComplete='email'
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
          <button className='login-forgot-password-buttons' type="submit">
            <FontAwesomeIcon icon={faSignInAlt} className="icon-margin" /> LOGIN
          </button>
        </form>

        <div className='single-sign-in-divs'>
          <div className="google-signin-container">
            <GoogleSignIn />
          </div>
          <div className='facebook-sigin-container'>
            <FacebookSignin />
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

        {/* Other UI elements */}
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

        {/* Forgot Password Modal */}
        {isModalOpen && (
          <ForgotPasswordModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            setLoginEmail={setEmail}
            setLoginPassword={setPassword}
          />
        )}

        {/* Show the generic alert popup */}
        {showPopUp && (
          <Popup
            message={popupMessage}
            onClose={() => setShowPopUp(false)}
          />
        )}

        {/* Show the confirmation popup */}
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
