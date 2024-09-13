import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Popup from '../utils/alert/Popup';
import './AdminProductUpload.css';

const AdminProductUpload = () => {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState('');
    const [singleProduct, setSingleProduct] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: 0,
        images: [],
        shop: ''
    });
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
    const [notification, setNotification] = useState({
        message: '',
        type: 'info'
    });
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [loadingNotification, setLoadingNotification] = useState(false);
    const [loadingShop, setLoadingShop] = useState(false);
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
                        navigate('/shops')
                    }
                } else {
                    navigate('/shops');
                }
            } catch (error) {
                navigate('/shops');
            }
        };

        const fetchShops = async () => {
            try {
                const response = await api.get('/shops');
                setShops(response.data);
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };

        if (isAuthenticated) {
            fetchUserData();
            fetchShops();
        } else {
            navigate('/login');
        }
    }, [isAuthenticated]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSingleProduct({ ...singleProduct, [name]: value });
    };

    const handleShopChange = (e) => {
        setSelectedShop(e.target.value);
        setSingleProduct({ ...singleProduct, shop: e.target.value });
    };

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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSingleProduct((prevProduct) => ({
            ...prevProduct,
            images: [...prevProduct.images, ...files]
        }));
    };

    const handleNotificationChange = (e) => {
        const { name, value } = e.target;
        setNotification({ ...notification, [name]: value });
    };

    const handleSingleSubmit = async (e) => {
        e.preventDefault();
        setLoadingProduct(true);
        try {
            const formData = new FormData();
            Object.keys(singleProduct).forEach(key => {
                if (key === 'images') {
                    singleProduct.images.forEach(image => formData.append('images', image));
                } else {
                    formData.append(key, singleProduct[key]);
                }
            });

            const response = await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPopupMessage(`Yayyy!! Product ${response.data.name} uploaded successfully!`);
            setShowPopup(true);
        } catch (error) {
            setPopupMessage('Ooops!! Error uploading product, please try again later');
            setShowPopup(true);
        } finally {
            setLoadingProduct(false);
        }
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
            setPopupMessage(`Yayyy!! Shop ${response.data.name} added successfully!`);
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
            setPopupMessage('Ooops!! Error adding shop, please try again later');
            setShowPopup(true);
        } finally {
            setLoadingShop(false);
        }
    };

    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        setLoadingNotification(true);
        try {
            await api.post('/notifications/send', notification);
            setPopupMessage('Yayyy!! Notification sent successfully to all customers!');
            setShowPopup(true);
        } catch (error) {
            setPopupMessage('Ooops!! Error sending notification, please try again later');
            setShowPopup(true);
        } finally {
            setLoadingNotification(false);
        }
    };

    return (
        <div className="admin-upload-page">
            <h1 className="admin-page-title">Admin Dashboard</h1>

            {/* Shop Creation Form */}
            <form onSubmit={handleShopSubmit} className="admin-form admin-shop-upload-form">
                <h2 className="admin-form-title">Add New Shop or Update Shop</h2>
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
                <button type="submit" className="admin-submit-button" disabled={loadingShop}>
                    {loadingShop ? 'Adding Shop...' : 'Add Shop'}
                </button>
            </form>

            {/* Product Upload Form */}
            <form onSubmit={handleSingleSubmit} className="admin-form admin-single-upload-form">
                <h2 className="admin-form-title">Upload New Product or Update Product</h2>
                {/* Shop Selection */}
                <select
                    name="shop"
                    value={selectedShop}
                    onChange={handleShopChange}
                    required
                    className="admin-input"
                >
                    <option value="">Select Shop</option>
                    {shops.map((shop) => (
                        <option key={shop._id} value={shop._id}>
                            {shop.name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    name="name"
                    placeholder="Product Name"
                    value={singleProduct.name}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Product Price"
                    value={singleProduct.price}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />
                <input
                    type="number"
                    name="discountPrice"
                    placeholder="Product Discount Price"
                    value={singleProduct.discountPrice}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />
                <textarea
                    name="description"
                    placeholder="Product Description"
                    value={singleProduct.description}
                    onChange={handleInputChange}
                    required
                    className="admin-textarea"
                />
                <input
                    type="text"
                    name="category"
                    placeholder="Product Category"
                    value={singleProduct.category}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />
                <input
                    type="number"
                    name="stock"
                    placeholder="Stock Quantity"
                    value={singleProduct.stock}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />
                <input
                    type="text"
                    name="synonyms"
                    placeholder="Synonyms (comma-separated)"
                    value={singleProduct.synonyms}
                    onChange={handleInputChange} // Capture synonym input
                    className="admin-input"
                />
                <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    required
                    className="admin-file-input"
                />
                {singleProduct.images.length > 0 && (
                    <ul className="admin-image-list">
                        {singleProduct.images.map((image, index) => (
                            <li key={index} className="admin-image-list-item">{image.name}</li>
                        ))}
                    </ul>
                )}
                <button type="submit" className="admin-submit-button" disabled={loadingProduct}>
                    {loadingProduct ? 'Uploading...' : 'Upload Product'}
                </button>
            </form>

            {/* Notification Form */}
            <form onSubmit={handleNotificationSubmit} className="admin-form admin-notification-form">
                <h2 className="admin-form-title">Post Notification</h2>
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
                <button type="submit" className="admin-submit-button" disabled={loadingNotification}>
                    {loadingNotification ? 'Sending...' : 'Post Notification'}
                </button>
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

export default AdminProductUpload;
