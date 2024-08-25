import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { clearCart } from '../../redux/actions/cartActions';
import './Payment.css';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentForm = () => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setEmail(data.email || '');
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();

    if (location.state && location.state.selectedAddress) {
      const addr = location.state.selectedAddress;
      setName(`${addr.firstName} ${addr.lastName}`);
      setContact(addr.phoneNumber || '');
      setAddress(`${addr.flat}, ${addr.street}, ${addr.city}, ${addr.state}, ${addr.zip}, ${addr.country}`);
    }
  }, [location.state]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!name || !email || !contact || !address) {
      setError('Please fill in all the required fields.');
      setProcessing(false);
      return;
    }

    const res = await loadRazorpay();

    if (!res) {
      setError('Razorpay SDK failed to load. Are you online?');
      setProcessing(false);
      return;
    }

    try {
      const { data } = await api.post('/create-razorpay-order', { amount: totalAmount * 100 });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'Himalayan Rasa',
        description: 'Payment for your order',
        order_id: data.id,
        handler: async function (response) {
          const paymentData = {
            orderCreationId: data.id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const result = await api.post('/verify-razorpay-payment', paymentData);

          if (result.data.status === 'success') {
            await api.post('/cart/clear');
            setSucceeded(true);
            setError(null);
            dispatch(clearCart());
            navigate('/payment-success', {
              state: {
                orderId: data.id,
                amount: totalAmount,
                name: name,
                contact: contact,
                address: location.state.selectedAddress,
                cartItems: cartItems
              }
            });
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: contact,
        },
        theme: {
          color: '#007bff',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      setError('Something went wrong. Please try again.');
      setProcessing(false);
    }

    setProcessing(false);
  };

  return (
    <div className="payment-form">
      <h2>Complete Your Payment</h2>
      <div className="total-amount">Total Amount: ₹{totalAmount.toFixed(2)}</div>
      
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input 
          type="text" 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)} 
          required 
          disabled
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          id="email" 
          value={email || ''}
          onChange={(e) => setEmail(e.target.value)} 
          required 
          disabled
        />
      </div>
      <div className="form-group">
        <label htmlFor="contact">Contact Number</label>
        <input 
          type="tel" 
          id="contact" 
          value={contact || ''}
          onChange={(e) => setContact(e.target.value)} 
          required 
          disabled
        />
      </div>
      <div className="form-group">
        <label htmlFor="address">Shipping Address</label>
        <textarea
          id="address"
          value={address || ''}
          onChange={(e) => setAddress(e.target.value)}
          required
          rows="3"
          disabled
        />
      </div>

      <button type="submit" className="pay-button" disabled={processing || succeeded} onClick={handleSubmit}>
        {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : "Pay Now"}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

const Payment = () => {
  return (
    <>
      <Helmet>
        <title>Payment - Himalayan Rasa</title>
      </Helmet>
      <div className="payment-page">
        <div className="payment-container">
          <h1>Checkout</h1>
          <PaymentForm />
        </div>
      </div>
    </>
  );
};

export default Payment;
