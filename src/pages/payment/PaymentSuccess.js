import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTruck, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount, name, contact, address, cartItems } = location.state;

  return (
    <div className="payment-success-container">
      <div className="payment-success-header">
        <FontAwesomeIcon icon={faCheckCircle} size="4x" className="payment-success-icon" />
        <div className="payment-success-title">Payment Successful!</div>
        <p className="payment-success-message">Your payment of ₹{amount.toFixed(2)} was processed successfully.</p>
      </div>

      <div className="payment-success-summary">
        <div className="payment-success-subtitle">Order Summary</div>
        <p className="payment-success-amount"><strong>Total Paid:</strong> ₹{amount.toFixed(2)}</p>
        <p className="payment-success-order-id"><strong>Order ID:</strong> {orderId}</p>
      </div>

      <div className="payment-success-shipping">
        <div className="payment-success-subtitle">Shipping Information</div>
        <p className="payment-success-shipping-name"><strong>Name:</strong> {name}</p>
        <p className="payment-success-shipping-contact"><strong>Phone Number:</strong> {contact}</p>
        <p className="payment-success-shipping-address">
          <strong>Address:</strong> {`${address.flat}, ${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`}
        </p>
      </div>

      <div className="payment-success-products">
        <div className="payment-success-subtitle">Purchased Products</div>
        <ul className="payment-success-products-list">
          {cartItems.map((item, index) => (
            <li key={index} className="payment-success-product-item">
              <strong>{item.productId.name}</strong> - Quantity: {item.quantity} - Price: ₹{item.productId.discountPrice.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <div className="payment-success-delivery">
        <FontAwesomeIcon icon={faTruck} size="3x" className="payment-success-delivery-icon" />
        <p className="payment-success-delivery-message">
          Sit back and relax! We will ensure your order gets delivered to you promptly.
        </p>
      </div>

      <button onClick={() => navigate('/shops')} className="payment-success-btn">
        <FontAwesomeIcon icon={faShoppingCart} className="payment-success-btn-icon" /> Continue Shopping
      </button>
    </div>
  );
};

export default PaymentSuccess;
