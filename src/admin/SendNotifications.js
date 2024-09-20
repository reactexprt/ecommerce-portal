import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import Popup from '../utils/alert/Popup';
import './AdminPage.css';

const SendNotifications = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const [notification, setNotification] = useState({
        message: '',
        type: 'info'
    });
    const [loadingNotification, setLoadingNotification] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/users/profile');
                if (response?.data && response.data?.isAdmin) {
                    if (response.data?.isAdmin) {
                        // render the page
                    } else {
                        setPopupMessage('🛑 "Whoa there! 🚫 You’re not authorized to access this page… but hey, do some good and maybe the gates will open for you! 😎✨')
                        navigate('/shops')
                    }
                } else {
                    navigate('/shops');
                }
            } catch (error) {
                navigate('/shops');
            }
        };

        if (isAuthenticated) {
            fetchUserData();
        } else {
            navigate('/login');
        }
    }, [isAuthenticated]);

    const handleNotificationChange = (e) => {
        const { name, value } = e.target;
        setNotification({ ...notification, [name]: value });
    };

    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        setLoadingNotification(true);
        try {
            await api.post('/notifications/send', notification);
            setPopupMessage('🎉 Yayyy!! Notification successfully sent to all customers! 📢');
            setShowPopup(true);
        } catch (error) {
            setPopupMessage('😓 Ooops!! Something went wrong sending the notification. Please try again later! 🔄');
            setShowPopup(true);
        } finally {
            setLoadingNotification(false);
        }
    };

    return (
        <div className="admin-upload-page">
            <h2 className="admin-page-title">Post a Notification to all users</h2>
            {/* Notification Form */}
            <form onSubmit={handleNotificationSubmit} className="admin-form admin-notification-form">
                <textarea
                    name="message"
                    placeholder="Notification Message"
                    value={notification.message}
                    onChange={handleNotificationChange}
                    required
                    className="admin-textarea"
                />
                <select
                    name="type"
                    value={notification.type}
                    onChange={handleNotificationChange}
                    required
                    className="admin-input"
                >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                </select>

                <div className='admin-page-button-divs'>
                    <button type="submit" className="admin-submit-button" disabled={loadingNotification}>
                        {loadingNotification ? 'Sending...' : 'Post Notification'}
                    </button>
                    <button onClick={() => navigate('/admin')} className="admin-submit-button" disabled={loadingNotification}>
                        Go Back to Admin Page
                    </button>
                </div>
            </form>
            {/* Popup for Notifications */}
            {showPopup && (
                <Popup
                    message={popupMessage}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </div>
    );
};

export default SendNotifications;
