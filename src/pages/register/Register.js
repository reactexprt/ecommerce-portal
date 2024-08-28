import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import './Register.css';

// WebAuthn library for registration
import { startRegistration } from '@simplewebauthn/browser';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      // Step 1: Register the user in the backend
      await api.post('/users/register', { username, email, password });

      // Step 2: Optionally prompt user to enable biometric login
      if (window.confirm('Do you want to enable biometric login for future logins?')) {
        try {
          // Get registration options from the server
          const optionsResponse = await api.post('/webauthn/registration-options', { email });
          // Start the registration process on the client
          const attestationResponse = await startRegistration(optionsResponse.data);
          // Send the attestation response back to the server to verify and store credentials
          await api.post('/webauthn/register', { email, credential: attestationResponse });

          alert('Biometric registration successful!');
        } catch (error) {
          console.error('Error during WebAuthn registration:', error);
          alert('Biometric registration failed. Please try again later.');
        }
      }

      // Redirect to login page after successful registration
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to register. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <>
      <Helmet>
        <title>R̥egister - Ħimalayan R̥asa</title>
      </Helmet>
      <div className="register-page">
        <h2>R̥EGISTER</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
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
          <button id='register-button' type="submit">CREATE NEW ACCOUNT</button>
        </form>
      </div>
    </>
  );
};

export default Register;
