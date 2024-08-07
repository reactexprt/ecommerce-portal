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
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={closeModal}>X</button>
        <div className="modal-body">
          <div className="modal-images">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="modal-thumbnail"
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
          <div className="modal-details">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p className="modal-price">₹{product.price}</p>
            <button className="add-to-cart-button" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-button" onClick={closeLightbox}>X</button>
            <img src={selectedImage} alt="Selected" className="lightbox-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
