import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../services/api';
import { addToCart } from '../../redux/actions/cartActions';
import './Modal.css';

const Modal = ({ product, closeModal }) => {
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    // Check if the product is already in the wishlist when the modal opens
    const checkWishlist = async () => {
      try {
        const response = await api.get('/wishlist');
        const isInWishlist = response.data.some(item => item._id === product._id);
        setInWishlist(isInWishlist);
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    };
    checkWishlist();
  }, [product._id]);

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    closeModal();
  };

  const toggleWishlist = async () => {
    try {
      if (inWishlist) {
        await api.post('/wishlist/remove', { productId: product._id });
        setInWishlist(false);
      } else {
        await api.post('/wishlist/add', { productId: product._id });
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
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
            <div className='modal-button-div'>
              <button className="custom-add-to-cart-button" onClick={handleAddToCart}>Add to Cart</button>
              <button className="custom-wishlist-button" onClick={toggleWishlist}>
                <i className={`fa-heart ${inWishlist ? 'fas' : 'far'}`}></i>
                {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
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
