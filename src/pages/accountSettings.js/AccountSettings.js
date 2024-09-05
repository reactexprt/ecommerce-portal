// src/components/AccountSettings.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AccountSettings.css';

const AccountSettings = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/profile');
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      await api.put('/users/profile', userData);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    try {
      await api.post('/users/change-password', { oldPassword, newPassword });
      setMessage('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError('Failed to change password');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="account-settings-wrapper">
      <h2 className="account-settings-title">Account Settings</h2>

      <div className="account-settings-section">
        <h3>Profile Information</h3>
        <input
          type="text"
          name="username"
          value={userData.username}
          onChange={handleInputChange}
          placeholder="Username"
          className="account-settings-input"
        />
        <input
          type="email"
          name="email"
          value={userData.email}
          placeholder="Email"
          disabled // Disabling email input
          className="account-settings-input"
        />
        {/* <input
          type="text"
          name="phoneNumber"
          value={userData.phoneNumber}
          onChange={handleInputChange}
          placeholder="Phone"
          className="account-settings-input"
        /> */}
        <button onClick={handleSaveChanges} className="account-settings-button">Save Changes</button>
      </div>

      {/* <div className="account-settings-section">
        <h3>Change Password</h3>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Old Password"
          className="account-settings-input"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="account-settings-input"
        />
        <button onClick={handlePasswordChange} className="account-settings-button">Change Password</button>
      </div> */}

      <div className="account-settings-section">
        <h3>Security Settings</h3>
        {/* Add Two-Factor Authentication and Biometric options here */}
      </div>

      <div className="account-settings-section">
        <h3>Email & Notification Preferences</h3>
        {/* Add Email and Notification Preferences settings here */}
      </div>

      <div className="account-settings-section">
        <h3>Address Book</h3>
        {/* Add Address management here */}
      </div>

      <div className="account-settings-section">
        <h3>Payment Methods</h3>
        {/* Add Payment methods management here */}
      </div>

      <div className="account-settings-section">
        <h3>Account Deletion</h3>
        <button className="account-settings-button">Deactivate Account</button>
        <button className="account-settings-button">Delete Account</button>
      </div>

      {message && <p className="account-settings-message account-settings-success">{message}</p>}
      {error && <p className="account-settings-message account-settings-error">{error}</p>}
    </div>
  );
};

export default AccountSettings;
