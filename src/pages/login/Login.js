// src/pages/Login.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ForgotPasswordModal from '../../components/forgotPassword/ForgotPasswordModal'; // Import the modal
import './Login.css';
import { login } from '../../redux/actions/authActions';
import GoogleSignIn from '../../components/GoogleSignIn';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login', { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.data.user, token: response.data.token } });
      dispatch(login(response.data.user, response.data.token));
      navigate('/products');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid email or password. Please try again.';
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
    <div className="login-page">
      <h2>LOGIN</h2>
      {error && <p className="error">{error}</p>}
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
      {isModalOpen 
        && 
        <ForgotPasswordModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          setLoginEmail={setEmail}
          setLoginPassword={setPassword}
        />
      }
    </div>
  );
};

export default Login;
