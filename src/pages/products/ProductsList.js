// src/pages/ProductsList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import ImageSlider from '../../components/imageSlider/ImageSlider';
import Modal from '../../components/model/Modal';
import './ProductsList.css';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="products-list">
      <h1>Our Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div className="product-card" key={product._id} onClick={() => handleProductClick(product)}>
            <ImageSlider images={product.images} />
            <div className="product-info">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-price">₹{product.price}</p>
            </div>
          </div>
        ))}
      </div>
      {selectedProduct && <Modal product={selectedProduct} closeModal={closeModal} />}
    </div>
  );
};

export default ProductsList;
