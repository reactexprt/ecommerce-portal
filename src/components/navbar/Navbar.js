import React, { useEffect, useState, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faHome, 
  faShoppingCart, 
  faSignInAlt, 
  faUserPlus, 
  faSignOutAlt, 
  faBoxOpen 
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import { logout } from '../../redux/actions/authActions';
import { fetchCart } from '../../redux/actions/cartActions';

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

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  const buttons = [
    { icon: faHome, tooltip: 'Home', onClick: () => navigate('/') },
    { icon: faBoxOpen, tooltip: 'Products', onClick: () => navigate('/products') },
    { icon: faShoppingCart, tooltip: 'Cart', onClick: () => navigate('/cart'), visible: isAuthenticated },
    { icon: faSignInAlt, tooltip: 'Login', onClick: () => navigate('/login'), visible: !isAuthenticated },
    { icon: faUserPlus, tooltip: 'Register', onClick: () => navigate('/register'), visible: !isAuthenticated, className: "register" },
    { icon: faSignOutAlt, tooltip: 'Logout', onClick: handleLogout, visible: isAuthenticated, className: "logout-icon-container" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo-title">
          <img src="/images/himalayanrasa.png" alt="Rasa Icon" className="navbar-icon" />
          <h1>Ħimalayan R̥asa</h1>
        </div>
        <div className="nav-buttons">
          <Suspense fallback={<div className="spinner-container"><FontAwesomeIcon icon={faSpinner} spin size="3x" /></div>}>
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
          </Suspense>
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
          </div>
        ))}
      </div>
    </>
  );
};

export default Navbar;
