import React, { useState, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import './Register.css';
const Popup = lazy(() => import('../../utils/alert/Popup')); // Importing Popup component

// WebAuthn library for registration
import { startRegistration } from '@simplewebauthn/browser';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPopUp, setShowPopUp] = useState(false); // For general popups
  const [popupMessage, setPopupMessage] = useState(''); // For holding popup message
  const [showConfirm, setShowConfirm] = useState(false); // For confirmation popups
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false); // Track registration completion
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPopupMessage('Passwords do not match');
      setShowPopUp(true);
      return;
    }
    setIsLoading(true);
    try {
      // Step 1: Register the user in the backend using username and email
      await api.post('/users/register', { username, email, password });

      // Registration is successful, show biometric confirmation popup
      setIsRegistrationComplete(true); // Registration succeeded, mark as complete
      setShowConfirm(true); // Show confirmation for enabling biometric login
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to register. Please try again.';
      setPopupMessage(errorMessage);
      setShowPopUp(true); // Display error popup
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBiometric = async () => {
    setIsLoading(true);
    try {
      // Send both username and email for biometric registration
      const optionsResponse = await api.post('/webauthn/registration-options', { identifier: email || username });
      const attestationResponse = await startRegistration(optionsResponse.data);
      await api.post('/webauthn/register', { identifier: email || username, credential: attestationResponse });

      setPopupMessage('Biometric registration successful, redirecting to Login page');
      setShowPopUp(true); // Show success message
    } catch (error) {
      setPopupMessage('Biometric registration failed. Please try again later.');
      setShowPopUp(true); // Show failure message
    } finally {
      setShowConfirm(false); // Close confirmation popup
      if (isRegistrationComplete) {
        // Only navigate if registration was successful
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Add a delay to show the success/failure message before navigating
      }
      setIsLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false); // Close confirmation popup
    setIsLoading(false);
    if (isRegistrationComplete) {
      navigate('/login'); // Redirect to login if registration is complete and canceled
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
        <p>Hang tight, adventurer! We're preparing your VIP pass to the magical world of Ħimalayan R̥asa. Your journey is about to begin!</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>R̥egister - Ħimalayan R̥asa</title>
      </Helmet>
      <div className="register-page">
        <h2>R̥EGISTER</h2>

        <form onSubmit={handleRegister}>
          <div className='inputDiv'>
            <label htmlFor='username'>USERNAME</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength="3"
              maxLength="20"
              autoComplete='username'
            />
          </div>
          <div className='inputDiv'>
            <label htmlFor='email'>EMAIL</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete='email'
            />
          </div>
          <div className='inputDiv'>
            <label htmlFor='password'>PASSWORD</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              autoComplete='new-password'
            />
          </div>
          <div className='inputDiv'>
            <label htmlFor='confirm-password'>CONFIRM PASSWORD</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete='new-password'
            />
          </div>
          <button id='register-button' type="submit" disabled={isLoading}>
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin className="icon-margin" />
            ) : (
              <FontAwesomeIcon icon={faUserPlus} className="icon-margin" />
            )}
            {isLoading ? 'Registering...' : 'Create New Account'}
          </button>
        </form>

        {/* Show general alert popup */}
        {showPopUp && (
          <Popup
            message={popupMessage}
            onClose={() => setShowPopUp(false)}
          />
        )}

        {/* Show confirm biometric login popup */}
        {showConfirm && (
          <Popup
            message="Do you want to enable biometric login for future logins?"
            onConfirm={handleConfirmBiometric}
            onCancel={handleCancelConfirm}
          />
        )}
      </div>
    </>
  );
};

export default Register;
