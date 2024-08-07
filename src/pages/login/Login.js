// src/pages/Login.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ForgotPasswordModal from '../../components/forgotPassword/ForgotPasswordModal'; // Import the modal
import './Login.css';
import { login } from '../../redux/actions/authActions';

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
      dispatch(login(email, password)); 
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
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
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <div className="login-footer">
        <button className="btn-link forgot-password" onClick={handleForgotPasswordClick}>
          Forgot Password?
        </button>
        <button className="btn-link new-user" onClick={() => navigate('/register')}>
          New User? Register
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
