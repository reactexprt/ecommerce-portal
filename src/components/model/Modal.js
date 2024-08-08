// src/components/Modal.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/actions/cartActions';
import './Modal.css';

const Modal = ({ product, closeModal }) => {
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    closeModal(); // Close the modal after adding to cart
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="custom-close-button" onClick={closeModal}>X</button>
        <div className="custom-modal-body">
          <div className="custom-modal-images">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="custom-modal-thumbnail"
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
          <div className="custom-modal-details">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p className="custom-modal-price">₹{product.price}</p>
            <button className="custom-add-to-cart-button" onClick={handleAddToCart}>ADD TO CART</button>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="custom-lightbox-overlay" onClick={closeLightbox}>
          <div className="custom-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="custom-lightbox-close-button" onClick={closeLightbox}>X</button>
            <img src={selectedImage} alt="Selected" className="custom-lightbox-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
