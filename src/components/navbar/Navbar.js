import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShoppingCart, faSignInAlt, faUserPlus, faSignOutAlt, faBoxOpen, faTags } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import { logout } from '../../redux/actions/authActions';
import  { fetchCart } from '../../redux/actions/cartActions';

const Navbar = () => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const buttons = [
    { icon: faHome, tooltip: 'Home', onClick: () => navigate('/home') },
    { icon: faBoxOpen, tooltip: 'Products', onClick: () => navigate('/products') },
    { icon: faShoppingCart, tooltip: 'Cart', onClick: () => navigate('/cart'), visible: isAuthenticated },
    { icon: faSignInAlt, tooltip: 'Login', onClick: () => navigate('/login'), visible: !isAuthenticated },
    { icon: faUserPlus, tooltip: 'Register', onClick: () => navigate('/register'), visible: !isAuthenticated, className: "register" },
    { icon: faSignOutAlt, tooltip: 'Logout', onClick: handleLogout, visible: isAuthenticated, className: "logout-icon-container" },
  ];

  return (
    <nav className="navbar">
      <h1>E-commerce Platform</h1>
      <div className="nav-buttons">
        {buttons.filter(button => button.visible !== false).map((button, index) => (
          <div
            key={index}
            className={`icon-button ${button.className || ''}`}
            onClick={button.onClick}
            onMouseEnter={() => setTooltip(button.tooltip)}
            onMouseLeave={() => setTooltip(null)}
          >
            <FontAwesomeIcon icon={button.icon} className="awesome-icon" />
            {tooltip === button.tooltip && <span className="tooltip">{tooltip}</span>}
            {button.tooltip === 'Cart' && cartItems.length > 0 && (
              <span className="cart-count">{cartItems.length}</span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
