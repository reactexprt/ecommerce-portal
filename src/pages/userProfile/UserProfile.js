// src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAddressBook, faCreditCard, faHeart, faCog } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import './UserProfile.css'; // Import the CSS file for styling

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get('/users/user-details'); // Fetch user details from API
        setUser(response.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
      }
      setLoading(false);
    };

    fetchUserDetails();
  }, []);

  if (error) return <div className="up-error">{error}</div>;

  if (loading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Your Profile - Himalayan Rasa</title>
      </Helmet>
      <div className="up-profile-container">
        <h2 className="up-heading">Welcome, {user?.username}</h2>

        <div className="up-grid">
          {/* Profile Details Card */}
          <div className="up-card up-profile-card">
            <h3>Profile Details</h3>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Biometric Enabled:</strong> {user.biometricEnabled ? 'Yes' : 'No'}</p>
          </div>

          {/* Quick Links to Other Features */}
          <div className="up-card up-quick-links">
            <h3>Quick Links</h3>
            <div className="up-link" onClick={() => window.location.href = '/paymentMethods'}>
              <FontAwesomeIcon icon={faCreditCard} className="up-link-icon" /> Payment Methods
            </div>
            <div className="up-link" onClick={() => window.location.href = '/wishlist'}>
              <FontAwesomeIcon icon={faHeart} className="up-link-icon" /> Wishlist
            </div>
            <div className="up-link" onClick={() => window.location.href = '/accountSettings'}>
              <FontAwesomeIcon icon={faCog} className="up-link-icon" /> Account Settings
            </div>
            <div className="up-link" onClick={() => window.location.href = '/addressBook'}>
              <FontAwesomeIcon icon={faAddressBook} className="up-link-icon" /> Manage Addresses
            </div>
          </div>

          {/* Address Card */}
          <div className="up-card up-address-card">
            <h3>Addresses</h3>
            {user.addresses.length > 0 ? (
              <ul className="up-address-list">
                {user.addresses.map((address, index) => (
                  <li key={index} className="up-address-item">
                    <p><strong>{address.label}:</strong> {address.firstName} {address.lastName}</p>
                    <p>{address.flat}, {address.street}, {address.city}, {address.state}, {address.zip}, {address.country}</p>
                    <p><strong>Phone:</strong> {address.phoneNumber}</p>
                    <p><strong>Default:</strong> {address.isDefault ? 'Yes' : 'No'}</p>
                  </li>
                ))}
              </ul>
            ) : <p>No addresses available.</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
