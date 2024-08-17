import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ErrorBoundaryWrapper from './components/ErrorBoundary';
import Navbar from './components/navbar/Navbar';
import { useSelector } from 'react-redux';
import setupInactivityTimeout from './utils/inactivityTimeout';
import history from './services/history';
import './App.css';

// Lazy loading components
const TechnicalErrorPage = lazy(() => import('./pages/techError/TechnicalErrorPage'));
const TimeoutPage = lazy(() => import('./pages/timeout/TimeoutPage'));
const Home = lazy(() => import('./pages/home/Home'));
const ProductsList = lazy(() => import('./pages/products/ProductsList'));
const Login = lazy(() => import('./pages/login/Login'));
const Register = lazy(() => import('./pages/register/Register'));
const Cart = lazy(() => import('./pages/cart/Cart'));
const Payment = lazy(() => import('./pages/payment/Payment'));
const PaymentSuccess = lazy(() => import('./pages/payment/PaymentSuccess'));

function App() {
  const authToken = localStorage.getItem('token');
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  const PrivateRoute = ({ children }) => {
    return !!authToken && isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  useEffect(() => {
    setupInactivityTimeout();
  }, []);

  return (
    <Router history={history}>
      <div className="App">
        <ErrorBoundaryWrapper>
          <Navbar />
          <Suspense fallback={<div className="spinner-container"><FontAwesomeIcon icon={faSpinner} spin size="3x" /></div>}>
            <Routes>
              <Route path="/technicalError" element={<TechnicalErrorPage />} />
              <Route path="/timeout" element={<TimeoutPage />} />
              <Route path="/" element={<Home />} exact />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/cart" 
                element={
                  <PrivateRoute>
                    <Cart />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/payment" 
                element={
                  <PrivateRoute>
                    <Payment />
                  </PrivateRoute>
                } 
              />
              <Route
                path="/products"
                element={
                  <PrivateRoute>
                    <ProductsList />
                  </PrivateRoute>
                }
              />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundaryWrapper>
      </div>
    </Router>
  );
}

export default App;
