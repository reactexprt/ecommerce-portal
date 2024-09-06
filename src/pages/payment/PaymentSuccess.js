import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Payment.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount, name, contact, address, cartItems } = location.state;

  return (
    <div className="success-page">
      <h2>Thank You for Your Purchase!</h2>
      <p>Your payment of ₹{amount.toFixed(2)} was successful.</p>

      <div className="order-details">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Phone Number:</strong> {contact}</p>
        <p><strong>Shipping Address:</strong></p>
        <p>
          {address.flat}, {address.street}, {address.city}, {address.state}, {address.zip}, {address.country}
        </p>

        <h3>Purchased Products:</h3>
        <ul>
          {cartItems.map((item, index) => (
            <li key={index}>
              <strong>{item.productId.name}</strong> - Quantity: {item.quantity} - Price: ₹{item.productId.discountPrice.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => navigate('/shops')} className="btn">
        Continue Shopping
      </button>
    </div>
  );
};

export default PaymentSuccess;
