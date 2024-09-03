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
  faUser 
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import { logout } from '../../redux/actions/authActions';
import { fetchCart, mergeCart } from '../../redux/actions/cartActions';

const Navbar = () => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(mergeCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
    setShowDropdown(false);
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      // Introduce a slight delay before closing the dropdown
      setTimeout(() => {
        setShowDropdown(false);
      }, 50); // 150ms delay
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
              onMouseEnter={() => setTooltip(button.tooltip)}
              onMouseLeave={() => setTooltip(null)}
              onClick={button.onClick}
            >
              <FontAwesomeIcon icon={button.icon} className="awesome-icon" />
              {tooltip === button.tooltip && <span className="tooltip">{tooltip}</span>}
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
