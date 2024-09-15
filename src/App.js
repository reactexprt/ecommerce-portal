import React, { useEffect, Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import LogRocket from 'logrocket';
import ErrorBoundaryWrapper from './components/ErrorBoundary';
import TechnicalErrorPage from './pages/techError/TechnicalErrorPage';
import NotFound from './pages/notFound/NotFound';
import Navbar from './components/navbar/Navbar';
import Popup from './utils/alert/Popup';
// import setupInactivityTimeout from './utils/inactivityTimeout';
import ScrollToTop from './utils/ScrollToTop';
import history from './services/history';
import './App.css';

if (process.env.NODE_ENV === 'production') {
  // Initialize LogRocket with custom settings
  LogRocket.init('65vbkg/rasa', {
    release: 'v2.0.0',       // Set release version for tracking
    shouldCaptureIP: false,   // Disable IP capture if not needed
    console: {
      isEnabled: true,
    },
    network: {
      isEnabled: true,        // Enable network request tracking
      requestSanitizer: (request) => {
        if (request.url.includes('sensitive')) {
          // Mask sensitive information from requests
          return null;
        }
        return request;
      },
    },
    dom: {
      isEnabled: true, // Enable DOM tracking
    },
  });

  // Capture custom errors or event types and log them
  window.addEventListener('error', (errorEvent) => {
    LogRocket.captureException(errorEvent.error);
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    LogRocket.captureException(event.reason);
  });

  // Handle service worker or Web Worker events if applicable
  navigator.serviceWorker?.addEventListener('message', (event) => {
    console.log('Service Worker Event:', event);
    if (!event.data || !event.data.action) {
      LogRocket.log('Invalid event type from worker:', event);
    }
  });
}

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
const Home = loadable(() => import('./pages/home/Home'));
const ProductsList = loadable(() => import('./pages/products/ProductsList'));
const ProductDetails = loadable(() => import('./pages/products/ProductDetails'));
const Login = loadable(() => import('./pages/login/Login'));
const Register = loadable(() => import('./pages/register/Register'));
const Cart = loadable(() => import('./pages/cart/Cart'));
const Payment = loadable(() => import('./pages/payment/Payment'));
const PaymentSuccess = loadable(() => import('./pages/payment/PaymentSuccess'));
const Footer = loadable(() => import('./pages/footer/Footer'));
const PreviousOrders = loadable(() => import('./pages/previousOrders/PreviousOrders'));
const UserProfile = loadable(() => import('./pages/userProfile/UserProfile'));
const AddressBook = loadable(() => import('./pages/addressBook/AddressBook'));
const AddressManager = loadable(() => import('./components/addressManager/AddressManager'));
const Wishlist = loadable(() => import('./pages/wishlist/Wishlist'));
const Notifications = loadable(() => import('./pages/notifications/Notifications'));
const AccountSettings = loadable(() => import('./pages/accountSettings/AccountSettings'));
const Shops = loadable(() => import('./pages/shops/Shops'));
const OrderDetails = loadable(() => import('./pages/previousOrders/OrderDetails'));
const AdminProductUpload = loadable(() => import('./admin/AdminProductUpload'));

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
  <div className="loading">
    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
    <p>Good things come to those who wait...</p>
  </div>
);

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const TIME_LIMIT = 30 * 60 * 1000; // 30 minutes
  let lastInactiveTime = new Date().getTime();

  const handleInactivityCheck = () => {
    const currentTime = new Date().getTime();
    const lastInactive = localStorage.getItem('lastInactiveTime');
    if (lastInactive && currentTime - lastInactive > TIME_LIMIT) {
      window.location.reload();
    }
  };

  // Auto-refresh only if the user has been inactive for more than the time limit
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleInactivityCheck();
      } else {
        lastInactiveTime = new Date().getTime();
        localStorage.setItem('lastInactiveTime', lastInactiveTime);
      }
    };

    const handleWindowFocus = () => {
      setTimeout(() => {
        handleInactivityCheck();
      }, 100);
    };

    const handleWindowBlur = () => {
      setTimeout(() => {
        lastInactiveTime = new Date().getTime();
        localStorage.setItem('lastInactiveTime', lastInactiveTime);
      }, 100);
    };

    // Periodic check for inactivity every 10 seconds
    const interval = setInterval(() => {
      handleInactivityCheck();
    }, 10 * 1000); // 10 seconds interval

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus); // Detect when user switches back to browser
    window.addEventListener('blur', handleWindowBlur);   // Detect when user switches out of browser

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      const retryInterval = setInterval(() => {
        if (navigator.onLine) {
          setIsOffline(false);
          clearInterval(retryInterval);
        }
      }, 5000); // Retry every 5 seconds

      return () => clearInterval(retryInterval);
    }
  }, [isOffline]);

  return (
    <Router history={history}>
      <ScrollToTop />
      <div className="App">
        {isOffline && (
          <Popup
            message='No Internet Connection. You are currently offline. Please check your internet connection and try again.'
            onClose={() => setIsOffline(false)}
          />
        )}
        <ErrorBoundaryWrapper>
          <Navbar />
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/technicalError" element={<TechnicalErrorPage />} />
              {/* <Route path="/timeout" element={<TimeoutPage />} /> */}
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
                path="/addresses"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <AddressManager />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <Payment />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/shops"
                element={
                  <ErrorBoundaryWrapper>
                    <Shops />
                  </ErrorBoundaryWrapper>
                }
              />
              <Route
                path="/shop/:shopId/products"
                element={
                  <ErrorBoundaryWrapper>
                    <ProductsList />
                  </ErrorBoundaryWrapper>
                }
              />
              <Route
                path="/products/product/:productId"
                element={
                  <ErrorBoundaryWrapper>
                    <ProductDetails />
                  </ErrorBoundaryWrapper>
                }
              />

              <Route 
                path="/admin" 
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <AdminProductUpload />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                } 
              />

              <Route
                path="/previousOrders"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <PreviousOrders />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/previousOrders/:orderId"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <OrderDetails />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <UserProfile />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/addressBook"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <AddressBook />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <Wishlist />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <Notifications />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/accountSettings"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <AccountSettings />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment-success"
                element={
                  <PrivateRoute>
                    <ErrorBoundaryWrapper>
                      <PaymentSuccess />
                    </ErrorBoundaryWrapper>
                  </PrivateRoute>
                }
              />
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
