// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './Navbar.css';
import { logout } from '../../redux/actions/authActions';

const Navbar = () => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="navbar">
      <h1>E-commerce Platform</h1>
      <div className="nav-buttons">
        <Link to="/" className="btn btn-home">HOME</Link>
        {isAuthenticated ? (
          <>
            <Link to="/cart" className="btn btn-cart">
              CART <span className="cart-count">{cartItems.length}</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-logout">LOGOUT</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn nav-btn-primary">LOGIN</Link>
            <Link to="/register" className="btn btn-secondary">REGISTER</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

