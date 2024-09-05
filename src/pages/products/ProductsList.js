import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom'; // Import useNavigate
import api from '../../services/api';
import ImageSlider from '../../components/imageSlider/ImageSlider';
import './ProductsList.css';

const ProductsList = () => {
  const { shopId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(8); // Load 8 products per page
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate(); // Use useNavigate for navigation

  useEffect(() => {
    const fetchProducts = async () => {
      setProducts([]);
      setLoading(true);
      try {
        const response = await api.get(`/shops/${shopId}/products?page=${currentPage}&limit=${limit}`);
        const { products, hasMore } = response.data;

        // Filter out duplicates based on the product ID
        setProducts(prevProducts => {
          const productMap = new Map(prevProducts.map(product => [product._id, product]));
          products.forEach(product => {
            if (!productMap.has(product._id)) {
              productMap.set(product._id, product);
            }
          });
          return Array.from(productMap.values());
        });

        setHasMore(hasMore); // Update hasMore state
      } catch (error) {
        setError('Error fetching products');
      }
      setLoading(false);
    };

    fetchProducts();
  }, [currentPage, shopId]);

  const loadMoreProducts = () => {
    if (hasMore) {
      setCurrentPage(prevPage => prevPage + 1); // Increment the page to load more products
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/product/${productId}`); // Navigate to the product details page using useNavigate
  };

  if (loading && currentPage === 1) { // Only show spinner during the initial load
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading Products...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>Products - Himalayan Rasa</title>
      </Helmet>
      <div className="products-list">
        <h1>Our Products</h1>
        <div className="products-grid">
          {products.map(product => (
            <div className="product-card" key={product._id} onClick={() => handleProductClick(product._id)}>
              <ImageSlider images={product.images} />
              <div className="product-info">
                <h2 className="product-name">{product.name}</h2>
                <p className="product-price">₹{product.price}</p>
              </div>
            </div>
          ))}
        </div>
        {hasMore && !loading && (
          <button onClick={loadMoreProducts} className="load-more-button">
            Load More Products
          </button>
        )}
        {loading && currentPage > 1 && (
          <div className="loading-more">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Loading more products...</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsList;
