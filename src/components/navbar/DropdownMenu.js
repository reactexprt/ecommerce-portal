// src/components/DropdownMenu.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faHistory,
  faAddressBook,
  faTruck,
  faHeart,
  faBell,
  faCog,
  faCreditCard,
  faLifeRing,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const DropdownMenu = ({ onNavigate, onLogout, unreadCount, dropdownRef, isBottomNav }) => {
  return (
    <div className={isBottomNav ? "bottom-dropdown-menu" : "dropdown-menu"} ref={dropdownRef}>
      <div onClick={() => onNavigate('/profile')}>
        <FontAwesomeIcon icon={faUser} className="dropdown-icon" />
        <span>Profile</span>
      </div>
      <div onClick={() => onNavigate('/previousOrders')}>
        <FontAwesomeIcon icon={faHistory} className="dropdown-icon" />
        <span>Order History</span>
      </div>
      {/* <div onClick={() => onNavigate('/addressBook')}>
        <FontAwesomeIcon icon={faAddressBook} className="dropdown-icon" />
        <span>Address Book</span>
      </div> */}
      <div onClick={() => onNavigate('/orderTracking')}>
        <FontAwesomeIcon icon={faTruck} className="dropdown-icon" />
        <span>Track My Orders</span>
      </div>
      <div onClick={() => onNavigate('/wishlist')}>
        <FontAwesomeIcon icon={faHeart} className="dropdown-icon" />
        <span>Wishlist</span>
      </div>
      <div onClick={() => onNavigate('/notifications')}>
        <FontAwesomeIcon icon={faBell} className="dropdown-icon" />
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </div>
      {/* <div onClick={() => onNavigate('/accountSettings')}>
        <FontAwesomeIcon icon={faCog} className="dropdown-icon" />
        <span>Account Settings</span>
      </div> */}
      <div onClick={() => onNavigate('/support')}>
        <FontAwesomeIcon icon={faLifeRing} className="dropdown-icon" />
        <span>Help & Support</span>
      </div>
      <div onClick={onLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default DropdownMenu;
