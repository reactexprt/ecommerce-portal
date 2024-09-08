import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShoppingCart, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { addToCart } from '../../redux/actions/cartActions';
import api from '../../services/api';
import './Wishlist.css';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        const response = await api.get('/wishlist');
        setWishlistItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error getting wishlist');
      }
      setLoading(false);
    };

    fetchWishlistItems();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      dispatch(addToCart(product));
      await api.post('/wishlist/remove', { productId: product._id });
      setWishlistItems(prevItems => prevItems.filter(item => item._id !== product._id));
    } catch (err) {
      console.error('Error adding to cart and removing from wishlist:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
        <p>Hold tight... we’re loading your favorite picks!</p>
      </div>
    );
  }

  if (!wishlistItems.length) return (
    <div className="wishlist-page-empty">
      <FontAwesomeIcon icon={faHeart} size="4x" />
      <p>Your wishlist is empty.</p>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Wishlist - Himalayan Rasa</title>
      </Helmet>
      <div className="wishlist-page-container">
        <h2>Your Wishlist</h2>
        <div className="wishlist-page-items">
          {wishlistItems.map(item => (
            <div key={item._id} className="wishlist-page-item">
              {item.images && item.images.length > 0 && (
                <img src={item.images[0]} alt={item.name} className="wishlist-page-item-image" />
              )}
              <p>{item.name}</p>
              <p className="wishlist-page-item-price">Price: ₹{item.price}</p>
              <button onClick={() => handleAddToCart(item)}>
                <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
