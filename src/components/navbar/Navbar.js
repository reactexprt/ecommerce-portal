import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faShoppingCart,
  faSignInAlt,
  faUserPlus,
  faUserCircle,
  faStore
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import { logout } from '../../redux/actions/authActions';
import { fetchCart, mergeCart } from '../../redux/actions/cartActions';
import api from '../../services/api';
import DropdownMenu from './DropdownMenu';
import SearchBar from '../../pages/search/SearchBar';

const Navbar = () => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(mergeCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await api.get('/notifications/unread-count');
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };
    if (isAuthenticated) {
      fetchUnreadNotifications();
    }
  }, [isAuthenticated, unreadCount]);

  const handleLogout = async () => {
    dispatch(logout());
    setShowDropdown(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
    setTooltip(null); // Disable tooltip when dropdown is open
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setTimeout(() => {
        setShowDropdown(false);
      }, 50);
    }
  };

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleNavigation = (path) => {
    setShowDropdown(false);
    navigate(path);
  };

  const buttons = [
    { icon: faHome, tooltip: 'Home', onClick: () => navigate('/') },
    { icon: faStore, tooltip: 'Shops', onClick: () => navigate('/shops') },
    { icon: faShoppingCart, tooltip: 'Cart', onClick: () => navigate('/cart') },
    { icon: faSignInAlt, tooltip: 'Login', onClick: () => navigate('/login'), visible: !isAuthenticated },
    { icon: faUserPlus, tooltip: 'Register', onClick: () => navigate('/register'), visible: !isAuthenticated, className: "register" },
    { icon: faUserCircle, tooltip: 'Account', onClick: handleProfileClick, visible: isAuthenticated, className: "profile-icon-container" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-section navbar-logo-title">
          <Link to="/" className="navbar-link">
            <img
              src="https://himalayanrasa-product-images.s3.ap-south-1.amazonaws.com/uploads/WebsiteImages/himalayanrasa.png"
              alt="Rasa Icon"
              className="navbar-icon"
            />
            <h1 className="navbar-full-title">Ħimalayan R̥asa</h1>
            <h1 className="navbar-short-title">ĦR̥</h1>
          </Link>
        </div>

        <div className="navbar-section search-section">
          <SearchBar /> {/* Place the search bar */}
        </div>

        <div className="navbar-section nav-buttons">
          {buttons.filter(button => button.visible !== false).map((button, index) => (
            <div
              key={index}
              className={`icon-button ${button.className || ''}`}
              onMouseEnter={() => !showDropdown && setTooltip(button.tooltip)}
              onMouseLeave={() => setTooltip(null)}
              onClick={button.onClick}
            >
              <FontAwesomeIcon icon={button.icon} className="awesome-icon" />
              {tooltip === button.tooltip && !showDropdown && <span className="tooltip">{tooltip}</span>}
              {button.tooltip === 'Cart' && cartItems.length > 0 && (
                <span className="cart-count">{cartItems.length}</span>
              )}
              {button.tooltip === 'Account' && showDropdown && (
                <DropdownMenu
                  onNavigate={handleNavigation}
                  onLogout={handleLogout}
                  unreadCount={unreadCount}
                  dropdownRef={dropdownRef}
                  isBottomNav={false}
                />
              )}
            </div>
          ))}
        </div>
      </nav>
      <div className="bottom-nav">
        {buttons.filter(button => button.visible !== false).map((button, index) => (
          <div
            key={index}
            className={`icon-button bottom-icon-button ${button.className || ''}`}
            onClick={button.onClick}
          >
            <FontAwesomeIcon icon={button.icon} className="awesome-icon" />
            <span>{button.tooltip}</span>
            {button.tooltip === 'Cart' && cartItems.length > 0 && (
              <span className="cart-count">{cartItems.length}</span>
            )}
            {button.tooltip === 'Account' && showDropdown && (
              <DropdownMenu
                onNavigate={handleNavigation}
                onLogout={handleLogout}
                unreadCount={unreadCount}
                dropdownRef={dropdownRef}
                isBottomNav={true}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Navbar;
