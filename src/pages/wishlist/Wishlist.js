import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/actions/cartActions';
import api from '../../services/api';
import './Wishlist.css';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        const response = await api.get('/wishlist');
        setWishlistItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error getting wishlist');
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      // Dispatch the action to add the item to the cart
      dispatch(addToCart(product));

      // Remove the item from the wishlist
      await api.post('/wishlist/remove', { productId: product._id });

      // Update the wishlist state to reflect the removal
      setWishlistItems(prevItems => prevItems.filter(item => item._id !== product._id));
    } catch (err) {
      console.error('Error adding to cart and removing from wishlist:', err);
    }
  };

  if (loading) return <div>Loading your wishlist...</div>;
  if (!wishlistItems.length) return <div>No items in your wishlist.</div>;

  return (
    <div className="wishlist-container">
      <h2>Your Wishlist</h2>
      <div className="wishlist-items">
        {wishlistItems.map(item => (
          <div key={item._id} className="wishlist-item">
            {/* Display the first image in the array */}
            {item.images && item.images.length > 0 && (
              <img src={item.images[0]} alt={item.name} className="wishlist-item-image" />
            )}
            <p>{item.name}</p>
            <p className="wishlist-item-price">Price: ₹{item.price}</p>
            <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
