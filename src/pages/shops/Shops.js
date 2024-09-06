import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import './Shops.css'; // Import the updated CSS file

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const response = await api.get('/shops');
        setShops(response.data);
      } catch (err) {
        console.error('Error fetching shops:', err);
      }
      setLoading(false);
    };
    fetchShops();
  }, []);

  const handleShopClick = (shopId) => {
    navigate(`/shop/${shopId}/products`);  // Navigate to products page for the selected shop
  };

  if (loading) {
    return (
      <div className="shop-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading Shops...</p>
      </div>
    );
  }

  return (
    <div className="shops-container">
      <h1 className="shops-title">Explore Our Shops</h1>
      <div className="shops-grid">
        {shops.map((shop) => (
          <div key={shop._id} className="shop-card" onClick={() => handleShopClick(shop._id)}>
            <div className="shop-image-container">
              {shop.images && shop.images.length > 0 ? (
                <img src={shop.images[0]} alt={shop.name} className="shop-image" />
              ) : (
                <div className="shop-image-placeholder">No Image Available</div>
              )}
            </div>

            <div className="shop-card-content">
              <h2 className="shop-name">{shop.name}</h2>
              <p className="shop-description">{shop.description}</p>
              <p className="shop-location"><strong>Location:</strong> {shop.location}</p>
              <p className="shop-contact"><strong>Contact:</strong> {shop.contactEmail}</p>
              <p className="shop-contact-phone"><strong>Phone:</strong> {shop.contactPhone}</p>
              
              <div className="shop-social-media">
                {shop.socialMediaLinks?.facebook && (
                  <a href={shop.socialMediaLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                )}
                {shop.socialMediaLinks?.instagram && (
                  <a href={shop.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram"></i>
                  </a>
                )}
                {shop.socialMediaLinks?.twitter && (
                  <a href={shop.socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter"></i>
                  </a>
                )}
                {shop.socialMediaLinks?.website && (
                  <a href={shop.socialMediaLinks.website} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-globe"></i>
                  </a>
                )}
              </div>
            </div>
            <div className='shop-buttons'>
              <button className="shop-explore-button">Explore Products</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shops;
