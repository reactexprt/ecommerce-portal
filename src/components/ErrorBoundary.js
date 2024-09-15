// src/components/ErrorBoundary.js
import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import LogRocket from 'logrocket';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // This updates state so the next render shows the fallback UI.
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service (LogRocket)
    console.error("ErrorBoundary caught an error", error, errorInfo);
    
    // Log error and errorInfo to LogRocket
    if (process.env.NODE_ENV === 'production') {
      LogRocket.captureException(error, {
        extra: errorInfo,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Navigate to error page only on the first error occurrence
    if (this.state.hasError && !prevState.hasError) {
      this.props.navigate('/technicalError');
    }
  }

  // Reset error boundary if navigating away from error
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.hasError && nextProps.location.pathname !== '/technicalError') {
      return { hasError: false };
    }
    return null;
  }

  render() {
    if (this.state.hasError) {
      return null; // Optionally, show a fallback UI or message instead of null
    }

    return this.props.children;
  }
}

// ErrorBoundaryWrapper to use with react-router's `useNavigate`
const ErrorBoundaryWrapper = (props) => {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
};

export default ErrorBoundaryWrapper;
