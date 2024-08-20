import React from 'react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">Not Found</h1>
      <p className="notfound-message">Oops! Something went wrong.</p>
      <a href="/" className="notfound-home-link">Go Back Home</a>
    </div>
  );
};

export default NotFound;
