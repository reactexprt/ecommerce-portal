// src/components/ErrorBoundary.js
import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.hasError && !prevState.hasError) {
      // Navigate to the Technical Error page
      this.props.navigate('/technicalError');
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // Return null to prevent rendering of the broken UI
    }

    return this.props.children;
  }
}

const ErrorBoundaryWrapper = (props) => {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
};

export default ErrorBoundaryWrapper;
