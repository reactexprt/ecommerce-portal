import React, { useState, useEffect } from 'react';
import api from '../services/api';
import history from '../services/history';
import './AdminProductUpload.css';

const AdminProductUpload = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [singleProduct, setSingleProduct] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: 0,
        images: []
    });
    const [notification, setNotification] = useState({
        message: '',
        type: 'info'
    });
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [loadingNotification, setLoadingNotification] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/users/profile');
                if (response.data && response.data.isAdmin) {
                    if (response.data.isAdmin) {
                        setIsAdmin(true);
                    } else {
                        history.push('/products')
                    }
                } else {
                    history.push('/');
                }
            } catch (error) {
                history.push('/');
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSingleProduct({ ...singleProduct, [name]: value });
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
            setMessage(`Product ${response.data.name} uploaded successfully!`);
        } catch (error) {
            setMessage('Error uploading product');
        } finally {
            setLoadingProduct(false);
        }
    };

    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        setLoadingNotification(true);
        try {
            await api.post('/notifications/send', notification);
            setMessage('Notification sent successfully!');
        } catch (error) {
            setMessage('Error sending notification');
        } finally {
            setLoadingNotification(false);
        }
    };

    return (
        <div className="admin-upload-page">
            <h1 className="admin-page-title">Admin Dashboard</h1>

            <form onSubmit={handleSingleSubmit} className="admin-form admin-single-upload-form">
                <h2 className="admin-form-title">Upload Single Product</h2>
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

            {message && <p className="admin-message">{message}</p>}
        </div>
    );
};

export default AdminProductUpload;
