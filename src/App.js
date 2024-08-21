import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ErrorBoundaryWrapper from './components/ErrorBoundary';
import Navbar from './components/navbar/Navbar';
import { useSelector } from 'react-redux';
import setupInactivityTimeout from './utils/inactivityTimeout';
import ScrollToTop from './utils/ScrollToTop';
import history from './services/history';
import './App.css';

const loadable = (importFunc) => {
  return lazy(() =>
    importFunc().catch((err) => {
      if (err.name === 'ChunkLoadError') {
        window.location.reload();
      }
      throw err;
    })
  );
};

// Lazy loading components with error handling
const TechnicalErrorPage = loadable(() => import('./pages/techError/TechnicalErrorPage'));
const Home = loadable(() => import('./pages/home/Home'));
const ProductsList = loadable(() => import('./pages/products/ProductsList'));
const Login = loadable(() => import('./pages/login/Login'));
const Register = loadable(() => import('./pages/register/Register'));
const Cart = loadable(() => import('./pages/cart/Cart'));
const Payment = loadable(() => import('./pages/payment/Payment'));
const PaymentSuccess = loadable(() => import('./pages/payment/PaymentSuccess'));
const Footer = loadable(() => import('./pages/footer/Footer'));

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
    <Router history={history}>
      <ScrollToTop />
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
          <Footer />
        </ErrorBoundaryWrapper>
      </div>
    </Router>
  );
}

export default App;
