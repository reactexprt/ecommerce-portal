import React, { useState } from 'react';
import './ForgotPasswordModal.css';
import api from '../../services/api'; // Adjust the path to your api file accordingly

const ForgotPasswordModal = ({ isOpen, onClose, setLoginEmail, setLoginPassword }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      // Make API call to handle password reset
      await api.post('/users/reset-password', { email, newPassword });
      setSuccess('Password reset successfully. You can now log in with your new password.');
      setError(null);
      setLoginEmail('');
      setLoginPassword('');
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      setSuccess(null);
    }
  };

  if (!isOpen) return null;

  // const handleOverlayClick = (e) => {
  //   if (e.target.className === 'forgot-password-modal') {
  //     onClose();
  //   }
  // };

  return (
    <div className="forgot-password-modal">
      <div className="modal-content">
        <div id="close-button-id">
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div>
          <h2>Reset Password</h2>
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
