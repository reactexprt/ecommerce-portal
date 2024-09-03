// src/components/Notifications.js
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
        setLoading(false);
      } catch (err) {
        console.log('Error fetching notifications');
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.post('/notifications/read', { notificationId });
      setNotifications(notifications.map(n => n._id === notificationId ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="notifications-container loading-container">
        <FontAwesomeIcon icon={faBell} spin size="2x" />
        <p>Loading your notifications...</p>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="notifications-container empty-container">
        <FontAwesomeIcon icon={faBell} size="4x" />
        <p>No notifications found.</p>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <h2>Your Notifications</h2>
      <ul className="notifications-list">
        {notifications.map(notification => (
          <li key={notification._id} className={`notification-item ${notification.read ? 'read' : ''}`}>
            <p>{notification.message}</p>
            {!notification.read && (
              <button onClick={() => markAsRead(notification._id)}>
                <FontAwesomeIcon icon={faCheckCircle} /> Mark as Read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
