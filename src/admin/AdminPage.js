import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Popup from '../utils/alert/Popup';
import './AdminPage.css';

const AdminPage = () => {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/users/profile');
                if (response?.data && response.data?.isAdmin) {
                    if (response.data?.isAdmin) {
                        setIsAdmin(true);
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

    return (
        <div className="admin-dashboard">
            <h1 className="admin-title">Admin Dashboard</h1>
            <div className="admin-buttons-container">
                <button
                    className="admin-nav-button"
                    onClick={() => navigate('/admin/add-shop')}
                >
                    Add Shop
                </button>
                <button
                    className="admin-nav-button"
                    onClick={() => navigate('/admin/add-product')}
                >
                    Add Product
                </button>
                <button
                    className="admin-nav-button"
                    onClick={() => navigate('/admin/send-notifications')}
                >
                    Post Notification
                </button>
            </div>

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

export default AdminPage;
