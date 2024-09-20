import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import Popup from '../utils/alert/Popup';
import './AdminPage.css';

const AddShop = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const [shop, setShop] = useState({
        name: '',
        description: '',
        location: '',
        contactEmail: '',
        contactPhone: '',
        socialMediaLinks: {
            facebook: '',
            instagram: '',
            twitter: '',
            website: ''
        },
        images: []
    });
    const [loadingShop, setLoadingShop] = useState(false);
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

    const handleShopInputChange = (e) => {
        const { name, value } = e.target;
        setShop({ ...shop, [name]: value });
    };

    const handleShopImageChange = (e) => {
        const files = Array.from(e.target.files);
        setShop((prevShop) => ({
            ...prevShop,
            images: [...prevShop.images, ...files]
        }));
    };

    const handleShopSubmit = async (e) => {
        e.preventDefault();
        setLoadingShop(true);
        try {
            const formData = new FormData();
            Object.keys(shop).forEach(key => {
                if (key === 'images') {
                    shop.images.forEach(image => formData.append('images', image));
                } else if (typeof shop[key] === 'object') {
                    // For social media links or any object-type field
                    Object.keys(shop[key]).forEach(subKey => {
                        formData.append(`${key}.${subKey}`, shop[key][subKey]);
                    });
                } else {
                    formData.append(key, shop[key]);
                }
            });

            const response = await api.post('/shops', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPopupMessage(`🎉 Yayyy!! Shop ${response.data.name} added successfully! 🏬✨`);
            setShowPopup(true);
            setShop({
                name: '',
                description: '',
                location: '',
                contactEmail: '',
                contactPhone: '',
                socialMediaLinks: { facebook: '', instagram: '', twitter: '', website: '' },
                images: []
            });
        } catch (error) {
            setPopupMessage('⚠️ Ooops!! Something went wrong while adding the shop. Please try again later. 🙏');
            setShowPopup(true);
        } finally {
            setLoadingShop(false);
        }
    };

    return (
        <div className="admin-upload-page">
            <h2 className="admin-page-title">Add New Shop or Update Shop</h2>
            {/* Shop Creation Form */}
            <form onSubmit={handleShopSubmit} className="admin-form admin-shop-upload-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Shop Name"
                    value={shop.name}
                    onChange={handleShopInputChange}
                    required
                    className="admin-input"
                />
                <textarea
                    name="description"
                    placeholder="Shop Description"
                    value={shop.description}
                    onChange={handleShopInputChange}
                    required
                    className="admin-textarea"
                />
                <input
                    type="text"
                    name="location"
                    placeholder="Shop Location"
                    value={shop.location}
                    onChange={handleShopInputChange}
                    required
                    className="admin-input"
                />
                <input
                    type="email"
                    name="contactEmail"
                    placeholder="Contact Email"
                    value={shop.contactEmail}
                    onChange={handleShopInputChange}
                    required
                    className="admin-input"
                />
                <input
                    type="tel"
                    name="contactPhone"
                    placeholder="Contact Phone"
                    value={shop.contactPhone}
                    onChange={handleShopInputChange}
                    className="admin-input"
                />
                <input
                    type="file"
                    multiple
                    onChange={handleShopImageChange}
                    className="admin-file-input"
                />
                {shop.images.length > 0 && (
                    <ul className="admin-image-list">
                        {shop.images.map((image, index) => (
                            <li key={index} className="admin-image-list-item">{image.name}</li>
                        ))}
                    </ul>
                )}
                <h3>Social Media Links</h3>
                <input
                    type="text"
                    name="socialMediaLinks.facebook"
                    placeholder="Facebook URL"
                    value={shop.socialMediaLinks.facebook}
                    onChange={(e) => setShop({ ...shop, socialMediaLinks: { ...shop.socialMediaLinks, facebook: e.target.value } })}
                    className="admin-input"
                />
                <input
                    type="text"
                    name="socialMediaLinks.instagram"
                    placeholder="Instagram URL"
                    value={shop.socialMediaLinks.instagram}
                    onChange={(e) => setShop({ ...shop, socialMediaLinks: { ...shop.socialMediaLinks, instagram: e.target.value } })}
                    className="admin-input"
                />
                <input
                    type="text"
                    name="socialMediaLinks.twitter"
                    placeholder="Twitter URL"
                    value={shop.socialMediaLinks.twitter}
                    onChange={(e) => setShop({ ...shop, socialMediaLinks: { ...shop.socialMediaLinks, twitter: e.target.value } })}
                    className="admin-input"
                />
                <input
                    type="text"
                    name="socialMediaLinks.website"
                    placeholder="Website URL"
                    value={shop.socialMediaLinks.website}
                    onChange={(e) => setShop({ ...shop, socialMediaLinks: { ...shop.socialMediaLinks, website: e.target.value } })}
                    className="admin-input"
                />
                <div className='admin-page-button-divs'>
                    <button type="submit" className="admin-submit-button" disabled={loadingShop}>
                        {loadingShop ? 'Adding Shop...' : 'Add Shop'}
                    </button>
                    <button onClick={() => navigate('/admin')} className="admin-submit-button" disabled={loadingShop}>
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

export default AddShop;
