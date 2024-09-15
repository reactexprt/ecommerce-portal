import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Recommendations.css';

const Recommendations = ({ cartItems }) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    // Assuming you have a function to fetch recommendations based on cart items
    fetchRecommendations(cartItems);
  }, [cartItems]);

  // Fetch recommended products based on cart items
  const fetchRecommendations = async (cartItems) => {
    try {
      // Mock API call to get recommendations (Replace with your real API)
      const response = await mockFetchRecommendedProducts(cartItems);
      setRecommendedProducts(response);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Mock function to simulate fetching recommended products
  const mockFetchRecommendedProducts = (cartItems) => {
    // You can replace this logic with real API data
    const exampleRecommendations = [
      {
        _id: 'product1',
        name: 'Recommended Product 1',
        price: 499,
        image: '/images/recommended1.jpg',
        stock: 10,
      },
      {
        _id: 'product2',
        name: 'Recommended Product 2',
        price: 599,
        image: '/images/recommended2.jpg',
        stock: 5,
      },
      {
        _id: 'product3',
        name: 'Recommended Product 3',
        price: 799,
        image: '/images/recommended3.jpg',
        stock: 0, // Out of stock
      },
    ];

    return new Promise((resolve) => {
      setTimeout(() => resolve(exampleRecommendations), 1000); // Simulate network delay
    });
  };

  if (!recommendedProducts.length) {
    return <p>No recommendations at the moment. Check back later!</p>;
  }

  return (
    <div className="recommendations-section">
      <h3>Recommended for You</h3>
      <div className="recommended-products">
        {recommendedProducts.map((product) => (
          <div className="recommended-product" key={product._id}>
            <Link to={`/products/product/${product._id}`} className="link-decoration-common">
              <img src={product.image} alt={product.name} className="recommended-product-image" />
              <h4>{product.name}</h4>
            </Link>
            <p>₹{product.price}</p>
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
