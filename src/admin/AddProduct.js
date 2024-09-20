import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Popup from '../utils/alert/Popup';
import './AdminPage.css';

const AddProduct = () => {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const navigate = useNavigate();
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState('');
    const [singleProduct, setSingleProduct] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: 0,
        length: 0,
        breadth: 0,
        height: 0,
        weight: 0,
        images: [],
        shop: ''
    });
    const [loadingProduct, setLoadingProduct] = useState(false);
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
            setLoadingProduct(false);
            navigate('/login');
        }
    }, [isAuthenticated]);

    const handleShopChange = (e) => {
        setSelectedShop(e.target.value);
        setSingleProduct({ ...singleProduct, shop: e.target.value });
    };

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
            setPopupMessage(`🎉 Yayyy!! Product ${response.data.product.name} uploaded successfully! 🛒`);
            setShowPopup(true);
        } catch (error) {
            setPopupMessage('⚠️ Ooops!! Something went wrong uploading the product. Please try again later. 😟');
            setShowPopup(true);
        } finally {
            setLoadingProduct(false);
        }
    };

    return (
        <div className="admin-upload-page">
            <h2 className="admin-page-title">Upload New Product or Update Product</h2>
            {/* Product Upload Form */}
            <form onSubmit={handleSingleSubmit} className="admin-form admin-single-upload-form">
                {/* Shop Selection */}
                <label htmlFor="shop" className="admin-label">Select Shop:</label>
                <select
                    id="shop"
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

                <label htmlFor="name" className="admin-label">Product Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Product Name"
                    value={singleProduct.name}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />

                <label htmlFor="price" className="admin-label">Product Price (₹):</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    placeholder="Product Price"
                    value={singleProduct.price}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />

                <label htmlFor="discountPrice" className="admin-label">Discount Price (₹):</label>
                <input
                    type="number"
                    id="discountPrice"
                    name="discountPrice"
                    placeholder="Product Discount Price"
                    value={singleProduct.discountPrice}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />

                <label htmlFor="description" className="admin-label">Product Description:</label>
                <textarea
                    id="description"
                    name="description"
                    placeholder="Product Description"
                    value={singleProduct.description}
                    onChange={handleInputChange}
                    required
                    className="admin-textarea"
                />

                <label htmlFor="category" className="admin-label">Category:</label>
                <input
                    type="text"
                    id="category"
                    name="category"
                    placeholder="Product Category"
                    value={singleProduct.category}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />

                <label htmlFor="stock" className="admin-label">Stock Quantity:</label>
                <input
                    type="number"
                    id="stock"
                    name="stock"
                    placeholder="Stock Quantity"
                    value={singleProduct.stock}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />

                {/* New fields for shipping-related dimensions */}
                <label htmlFor="length" className="admin-label">Length (cm):</label>
                <input
                    type="number"
                    id="length"
                    name="length"
                    placeholder="Length (cm)"
                    value={singleProduct.length}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />

                <label htmlFor="breadth" className="admin-label">Breadth (cm):</label>
                <input
                    type="number"
                    id="breadth"
                    name="breadth"
                    placeholder="Breadth (cm)"
                    value={singleProduct.breadth}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />

                <label htmlFor="height" className="admin-label">Height (cm):</label>
                <input
                    type="number"
                    id="height"
                    name="height"
                    placeholder="Height (cm)"
                    value={singleProduct.height}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />

                <label htmlFor="weight" className="admin-label">Weight (kg):</label>
                <input
                    type="number"
                    id="weight"
                    name="weight"
                    placeholder="Weight (kg)"
                    value={singleProduct.weight}
                    onChange={handleInputChange}
                    required
                    className="admin-input"
                />

                <label htmlFor="synonyms" className="admin-label">Synonyms</label>
                <input
                    type="text"
                    id="synonyms"
                    name="synonyms"
                    placeholder="Synonyms (comma-separated)"
                    value={singleProduct.synonyms || ''}
                    onChange={handleInputChange} // Capture synonym input
                    required
                    className="admin-input"

                />

                {/* Image Upload */}
                <label htmlFor="images" className="admin-label">Product Images:</label>
                <input
                    type="file"
                    id="images"
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

                {/* Submission Buttons */}
                <div className="admin-page-button-divs">
                    <button type="submit" className="admin-submit-button" disabled={loadingProduct}>
                        {loadingProduct ? 'Uploading...' : 'Upload Product'}
                    </button>
                    <button onClick={() => navigate('/admin')} className="admin-submit-button" disabled={loadingProduct}>
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

export default AddProduct;
