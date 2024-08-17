import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount, name, contact, address, cartItems } = location.state;

  useEffect(() => {
    const sendOrder = async () => {
      try {
        await api.post('/orders/order', {
          shippingAddress: address,
          cartItems,
          totalAmount: amount,
          paymentStatus: 'Paid'
        });
      } catch (error) {
        console.error('Error sending order:', error);
      }
    };
  
    sendOrder();
  }, [address, amount, cartItems]);

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
              <strong>{item.productId.name}</strong> - Quantity: {item.quantity} - Price: ₹{item.productId.price.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => navigate('/products')} className="btn">
        Continue Shopping
      </button>
    </div>
  );
};

export default PaymentSuccess;
