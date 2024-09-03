// src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  if (loading) return <div className="loading">Loading your profile...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Helmet>
        <title>Ÿour Profile - Ħimalayan R̥asa</title>
      </Helmet>
      <div className="user-profile-container">
        <h2>Your Profile</h2>
        {user && (
          <div className="user-details">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {/* <p><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p> */}
            <p><strong>Biometric Enabled:</strong> {user.biometricEnabled ? 'Yes' : 'No'}</p>
            <h3>Addresses:</h3>
            <ul>
              {user.addresses.map((address, index) => (
                <li key={index}>
                  <p><strong>{address.label}:</strong> {address.firstName} {address.lastName}</p>
                  <p>{address.flat}, {address.street}, {address.city}, {address.state}, {address.zip}, {address.country}</p>
                  <p><strong>Phone:</strong> {address.phoneNumber}</p>
                  <p><strong>Default:</strong> {address.isDefault ? 'Yes' : 'No'}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default UserProfile;
