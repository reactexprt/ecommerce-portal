import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faShoppingCart,
  faSignInAlt,
  faUserPlus,
  faSignOutAlt,
  faBoxOpen,
  faUserCircle,
  faHistory,
  faUser,
  faCog,
  faHeart,
  faAddressBook,
  faTruck,
  faLifeRing,
  faBell,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import { logout } from '../../redux/actions/authActions';
import { fetchCart, mergeCart } from '../../redux/actions/cartActions';
import api from '../../services/api';

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

    fetchUnreadNotifications();
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
    setShowDropdown(false);
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
    { icon: faBoxOpen, tooltip: 'Products', onClick: () => navigate('/products') },
    { icon: faShoppingCart, tooltip: 'Cart', onClick: () => navigate('/cart') },
    { icon: faSignInAlt, tooltip: 'Login', onClick: () => navigate('/login'), visible: !isAuthenticated },
    { icon: faUserPlus, tooltip: 'Register', onClick: () => navigate('/register'), visible: !isAuthenticated, className: "register" },
    { icon: faUserCircle, tooltip: 'Account', onClick: handleProfileClick, visible: isAuthenticated, className: "profile-icon-container" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo-title">
          <img
            src="https://himalayanrasa-product-images.s3.ap-south-1.amazonaws.com/uploads/WebsiteImages/himalayanrasa.png"
            alt="Rasa Icon"
            className="navbar-icon"
          />
          <h1>Ħimalayan R̥asa</h1>
        </div>
        <div className="nav-buttons">
          {buttons.filter(button => button.visible !== false).map((button, index) => (
            <div
              key={index}
              className={`icon-button ${button.className || ''}`}
              onMouseEnter={() => !showDropdown && setTooltip(button.tooltip)}  // Disable tooltip when dropdown is open
              onMouseLeave={() => setTooltip(null)}
              onClick={button.onClick}
            >
              <FontAwesomeIcon icon={button.icon} className="awesome-icon" />
              {tooltip === button.tooltip && !showDropdown && <span className="tooltip">{tooltip}</span>}
              {button.tooltip === 'Cart' && cartItems.length > 0 && (
                <span className="cart-count">{cartItems.length}</span>
              )}
              {button.tooltip === 'Account' && showDropdown && (
                <div className="dropdown-menu" ref={dropdownRef}>
                  <div onClick={() => handleNavigation('/profile')}>
                    <FontAwesomeIcon icon={faUser} className="dropdown-icon" />
                    <span>Profile</span>
                  </div>
                  <div onClick={() => handleNavigation('/previousOrders')}>
                    <FontAwesomeIcon icon={faHistory} className="dropdown-icon" />
                    <span>Previous Orders</span>
                  </div>
                  <div onClick={() => handleNavigation('/addressBook')}>
                    <FontAwesomeIcon icon={faAddressBook} className="dropdown-icon" />
                    <span>Address Book</span>
                  </div>
                  <div onClick={() => handleNavigation('/orderTracking')}>
                    <FontAwesomeIcon icon={faTruck} className="dropdown-icon" />
                    <span>Track My Orders</span>
                  </div>
                  <div onClick={() => handleNavigation('/wishlist')}>
                    <FontAwesomeIcon icon={faHeart} className="dropdown-icon" />
                    <span>Wishlist</span>
                  </div>
                  <div onClick={() => handleNavigation('/notifications')}>
                    <FontAwesomeIcon icon={faBell} className="dropdown-icon" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="notification-count">{unreadCount}</span>
                    )}
                  </div>
                  <div onClick={() => handleNavigation('/accountSettings')}>
                    <FontAwesomeIcon icon={faCog} className="dropdown-icon" />
                    <span>Account Settings</span>
                  </div>
                  <div onClick={() => handleNavigation('/paymentMethods')}>
                    <FontAwesomeIcon icon={faCreditCard} className="dropdown-icon" />
                    <span>Payment Methods</span>
                  </div>
                  <div onClick={() => handleNavigation('/support')}>
                    <FontAwesomeIcon icon={faLifeRing} className="dropdown-icon" />
                    <span>Help & Support</span>
                  </div>
                  <div onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
                    <span>Logout</span>
                  </div>
                </div>
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
              <div className="bottom-dropdown-menu" ref={dropdownRef}>
                <div onClick={() => handleNavigation('/profile')}>
                  <FontAwesomeIcon icon={faUser} className="dropdown-icon" />
                  <span>Profile</span>
                </div>
                <div onClick={() => handleNavigation('/previousOrders')}>
                  <FontAwesomeIcon icon={faHistory} className="dropdown-icon" />
                  <span>Previous Orders</span>
                </div>
                <div onClick={() => handleNavigation('/addressBook')}>
                  <FontAwesomeIcon icon={faAddressBook} className="dropdown-icon" />
                  <span>Address Book</span>
                </div>
                <div onClick={() => handleNavigation('/orderTracking')}>
                  <FontAwesomeIcon icon={faTruck} className="dropdown-icon" />
                  <span>Track My Orders</span>
                </div>
                <div onClick={() => handleNavigation('/wishlist')}>
                  <FontAwesomeIcon icon={faHeart} className="dropdown-icon" />
                  <span>Wishlist</span>
                </div>
                <div onClick={() => handleNavigation('/notifications')}>
                  <FontAwesomeIcon icon={faBell} className="dropdown-icon" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="notification-count">{unreadCount}</span>
                  )}
                </div>
                <div onClick={() => handleNavigation('/accountSettings')}>
                  <FontAwesomeIcon icon={faCog} className="dropdown-icon" />
                  <span>Account Settings</span>
                </div>
                <div onClick={() => handleNavigation('/paymentMethods')}>
                  <FontAwesomeIcon icon={faCreditCard} className="dropdown-icon" />
                  <span>Payment Methods</span>
                </div>
                <div onClick={() => handleNavigation('/support')}>
                  <FontAwesomeIcon icon={faLifeRing} className="dropdown-icon" />
                  <span>Help & Support</span>
                </div>
                <div onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Navbar;
