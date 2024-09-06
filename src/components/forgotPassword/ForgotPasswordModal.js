import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import './ForgotPasswordModal.css';
import api from '../../services/api'; // Adjust the path to your api file accordingly

const ForgotPasswordModal = ({ isOpen, onClose, setLoginEmail, setLoginPassword }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/request-reset-password', { email });
      setOtpSent(true);
      setError(null);
      setSuccess('OTP has been sent to your email.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await api.post('/users/verify-otp', { email, otp, newPassword });
      setSuccess('Password reset successfully. You can now log in with your new password.');
      setError(null);
      setLoginEmail(email);
      setLoginPassword(newPassword);
      setEmail('');
      setOtp('');
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

  return (
    <div className="forgot-password-modal">
      <div className="modal-content">
        <div id="close-button-id">
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div>
          <h2>RESET PASSWORD</h2>
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        {!otpSent ? (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className='login-forgot-password-buttons' type="submit" disabled={loading}>
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'REQUEST OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>NEW PASSWORD</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>CONFIRM PASSWORD</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button className='login-forgot-password-buttons' type="submit">RESET PASSWORD</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
