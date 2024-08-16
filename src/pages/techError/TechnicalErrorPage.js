// src/pages/TechnicalErrorPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './TechnicalErrorPage.css';

const TechnicalErrorPage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Ʈechnical Ęrror - Ħimalayan R̥asa</title>
      </Helmet>
      <div className="error-container">
        <div className="error-content">
          <h1>Oops! Something Went Wrong</h1>
          <p>We're sorry, but something went wrong on our end. Please try again later.</p>
          <button className="error-button" onClick={handleBackToHome}>BACK TO HOME</button>
        </div>
      </div>
    </>
  );
};

export default TechnicalErrorPage;
