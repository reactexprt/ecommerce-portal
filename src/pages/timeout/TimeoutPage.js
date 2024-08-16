import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './TimeoutPage.css';

const TimeoutPage = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Ʈimeout - Ħimalayan R̥asa</title>
      </Helmet>
      <div className="timeout-container">
        <div className="timeout-content">
          <div className="timeout-header">
            <h1>Session Timeout</h1>
            <p>Your session has expired due to inactivity.</p>
          </div>
          <div className="timeout-body">
            <p>For your security, you have been logged out. Please log in again to continue.</p>
          </div>
          <button className="timeout-button" onClick={handleBackToLogin}>BACK TO LOGIN</button>
        </div>
      </div>
    </>
  );
};

export default TimeoutPage;
