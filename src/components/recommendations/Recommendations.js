import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Recommendations.css';

const Recommendations = ({ cartItems }) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    // Fetch recommended products based on cart items
    if (cartItems.length > 0) {
      fetchRecommendations(cartItems);
    }
  }, [cartItems]);

  // Fetch recommended products from the API
  const fetchRecommendations = async (cartItems) => {
    try {
      const productIds = cartItems.map((item) => item.productId._id); // Extract product IDs from cart items

      // Make an API call to get related products
      const response = await api.post('/products/related', { productIds });
      const data = response.data;

      // Prepend the hardcoded product to the fetched related products
      setRecommendedProducts(data.products);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  if (!recommendedProducts.length) {
    return (
      <div className="no-recommendations-section">
        <p className="no-recommendations-message">No recommendations at the moment. Please, Check back later!</p>
      </div>
    );
  }

  return (
    <div className="recommendations-section">
      <h3>Recommended for You</h3>
      <div className="recommended-products">
        {recommendedProducts.map((product) => (
          <div className="recommended-product" key={product._id}>
            <Link to={`/products/product/${product._id}`} className="link-decoration-common">
              {/* Accessing the first image from the images array */}
              <img
                src={product.images && product.images.length > 0 ? product.images[0] : '/images/default.jpg'}
                alt={product.name}
                className="recommended-product-image"
              />
              <h4>{product.name}</h4>
            </Link>

            {/* Show discount price with original price */}
            <p className="product-price">
              {product.discountPrice ? (
                <>
                  <span className="product-original-price">₹{product.price}</span>
                  <span className="product-discount-price">₹{product.discountPrice}</span>
                </>
              ) : (
                `₹${product.price}`
              )}
            </p>

            {product.stock > 0 ? (
              <p className="in-stock">In stock: {product.stock}</p>
            ) : (
              <p className="out-of-stock">Out of stock</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
