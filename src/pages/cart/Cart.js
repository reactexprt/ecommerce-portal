import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fetchCart, removeFromCart, updateCartItem } from '../../redux/actions/cartActions';
import AddressManager from '../../components/addressManager/AddressManager';
import './Cart.css';

const Cart = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const cartItems = useSelector(state => state.cart.cartItems) || [];
  const isLoading = useSelector(state => state.cart.isLoading);
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); // Redirect to login if not authenticated when trying to access cart
    } else {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading Cart...</p>
      </div>
    );
  }
  

  const totalAmount = cartItems.reduce((sum, item) => {
    if (item.productId && item.productId.price) {
      return sum + item.productId.price * item.quantity;
    }
    return sum;
  }, 0);

  const handleOrderConfirm = () => {
    if (selectedAddress) {
      navigate('/payment', {
        state: {
          selectedAddress,
          totalAmount,
          cartItems
        }
      });
    } else {
      alert('Please add and select a delivery address before proceeding to payment page.');
    }

  };

  if (cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Çart - Ħimalayan R̥asa</title>
        </Helmet>
        <div className="cart-empty">
          <h2>YOUR CART IS EMPTY</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn btn-shop">Go Shopping</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Çart - Ħimalayan R̥asa</title>
      </Helmet>
      <div className="cart-page">
        <h2>YOUR SHOPPING CART</h2>
        <div className="cart-items">
          {cartItems.map((item, index) => (
            <div className="cart-item" key={index}>
              {item.productId && (
                <>
                  <img src={item.productId.images[0]} alt={item.productId.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <div className="cart-item-info">
                      <h3>{item.productId.name}</h3>
                      <p>₹{(item.productId.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        onClick={() => dispatch(updateCartItem(item.productId._id, item.quantity - 1))}
                        disabled={item.quantity === 1}
                        className={item.quantity === 1 ? 'disabled-button' : ''}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button onClick={() => dispatch(updateCartItem(item.productId._id, item.quantity + 1))}>+</button>
                    </div>
                    <button className="remove-button" onClick={() => dispatch(removeFromCart(item.productId._id))}>Remove</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="cart-total">
          <h3>TOTAL AMOUNT: ₹{(totalAmount).toFixed(2)}</h3>
          {/* <button className="buy-button" onClick={() => navigate('/payment', { state: { totalAmount } })}>Click to Buy</button> */}
        </div>
        <AddressManager onSelectAddress={setSelectedAddress} />
        <button 
          className='buy-button'  //${!selectedAddress ? 'disabled' : ''}
          onClick={handleOrderConfirm} 
          // disabled={!selectedAddress}
          title={!selectedAddress ? 'Please add and select an address before proceeding' : ''}
        >
          BUY NOW
        </button>
      </div>
    </>
  );
};

export default Cart;
