// src/pages/Cart.js
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, removeFromCart, updateCartItem } from '../../redux/actions/cartActions';
import './Cart.css';

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems) || [];
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Calculate the total amount correctly
  const totalAmount = cartItems.reduce((sum, item) => {
    if (item.productId && item.productId.price) {
      return sum + item.productId.price * item.quantity;
    }
    return sum;
  }, 0);

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn btn-shop">Go Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Your Shopping Cart</h2>
      <div className="cart-items">
        {cartItems.map((item, index) => (
          <div className="cart-item" key={index}>
            {item.productId && (
              <>
                <img src={item.productId.images[0]} alt={item.productId.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <div className="cart-item-info">
                    <h3>{item.productId.name}</h3>
                    <p>${(item.productId.price * item.quantity).toFixed(2)}</p> {/* Display the total price for this item */}
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
        <h3>Total Amount: ${(totalAmount).toFixed(2)}</h3> {/* Display total amount correctly */}
        <button className="buy-button" onClick={() => navigate('/payment', { state: { totalAmount } })}>Click to Buy</button>
      </div>
    </div>
  );
};

export default Cart;
