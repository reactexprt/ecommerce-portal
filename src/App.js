import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ErrorBoundaryWrapper from './components/ErrorBoundary';
import Navbar from './components/navbar/Navbar';
import { useSelector } from 'react-redux';
import setupInactivityTimeout from './utils/inactivityTimeout';
import './App.css';

// Lazy loading components
const TechnicalErrorPage = lazy(() => import('./pages/techError/TechnicalErrorPage'));
const Home = lazy(() => import('./pages/home/Home'));
const ProductsList = lazy(() => import('./pages/products/ProductsList'));
const Login = lazy(() => import('./pages/login/Login'));
const Register = lazy(() => import('./pages/register/Register'));
const Cart = lazy(() => import('./pages/cart/Cart'));
const Payment = lazy(() => import('./pages/payment/Payment'));
const PaymentSuccess = lazy(() => import('./pages/payment/PaymentSuccess'));

// Import TimeoutPage and NotFound directly
import TimeoutPage from './pages/timeout/TimeoutPage';
import NotFound from './pages/notFound/NotFound';

const useAuth = () => {
  const authToken = localStorage.getItem('token');
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return !!authToken && isAuthenticated;
};

const PrivateRoute = ({ children }) => {
  const isAuth = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
};

const Spinner = () => (
  <div className="spinner-container">
    <FontAwesomeIcon icon={faSpinner} spin size="3x" />
    <p>Loading content, please wait...</p>
  </div>
);

function App() {
  useEffect(() => {
    setupInactivityTimeout();
  }, []);

  return (
    <Router>
      <div className="App">
        <ErrorBoundaryWrapper>
          <Navbar />
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/technicalError" element={<TechnicalErrorPage />} />
              <Route path="/timeout" element={<TimeoutPage />} />
              <Route 
                path="/" 
                element={
                  <ErrorBoundaryWrapper>
                    <Home />
                  </ErrorBoundaryWrapper>
                } 
                exact 
              />
              <Route 
                path="/login" 
                element={
                  <ErrorBoundaryWrapper>
                    <Login />
                  </ErrorBoundaryWrapper>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <ErrorBoundaryWrapper>
                    <Register />
                  </ErrorBoundaryWrapper>
                } 
              />
              <Route
                path="/cart"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <Cart />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <Payment />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <ProductsList />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundaryWrapper>
      </div>
    </Router>
  );
}

export default App;
