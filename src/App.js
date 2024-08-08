import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ErrorBoundaryWrapper from './components/ErrorBoundary';
import TechnicalErrorPage from './pages/techError/TechnicalErrorPage';
import TimeoutPage from './pages/timeout/TimeoutPage';
import Navbar from './components/navbar/Navbar';
import Home from './pages/home/Home';
import ProductsList from './pages/products/ProductsList';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Cart from './pages/cart/Cart';
import Payment from './pages/payment/Payment';
import { useSelector } from 'react-redux';
import setupInactivityTimeout from './utils/inactivityTimeout';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  useEffect(() => {
    setupInactivityTimeout();
  }, []);

  return (
    <Router>
      <div className="App">
        <ErrorBoundaryWrapper>
          <Navbar />
          <Routes>
            <Route path="/technical-error" element={<TechnicalErrorPage />} />
            <Route path="/timeout" element={<TimeoutPage />} />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} />
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <ProductsList />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundaryWrapper>
      </div>
    </Router>
  );
}

export default App;
