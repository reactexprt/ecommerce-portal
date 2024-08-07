// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ErrorBoundaryWrapper from './components/ErrorBoundary';
import TechnicalErrorPage from './pages/techError/TechnicalErrorPage';
import Navbar from './components/navbar/Navbar';
import Home from './pages/home/Home';
import ProductsList from './pages/products/ProductsList';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Cart from './pages/cart/Cart';
import Payment from './pages/payment/Payment';
import history from './services/history';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
      <Router history={history} >
        <div className="App">
          <ErrorBoundaryWrapper>
            <Navbar />
            <Routes>
              <Route path="/technical-error" component={TechnicalErrorPage} />
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
