import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLock, faShieldAlt, faUserSecret, faUniversity, faMoneyCheckAlt, faWallet, faCreditCard, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faCcVisa, faCcMastercard, faGooglePay } from '@fortawesome/free-brands-svg-icons';
import {  } from '@fortawesome/free-solid-svg-icons'; 
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

const sendOrder = async (address, totalAmount, cartItems) => {
  try {
    await api.post('/orders/order', {
      shippingAddress: address,
      cartItems,
      totalAmount,
      paymentStatus: 'Paid'
    });
  } catch (error) {
    console.error('Error sending order');
  }
};

const PaymentForm = ({ setLoading }) => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
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
      setLoading(true);
      try {
        const { data } = await api.get('/users/profile');
        setEmail(data.email || '');
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
  
    if (isAuthenticated) {
      fetchUserProfile();
  
      if (location.state && location.state.selectedAddress) {
        const addr = location.state.selectedAddress;
        setName(`${addr.firstName} ${addr.lastName}`);
        setContact(addr.phoneNumber || '');
        setAddress(`${addr.flat}, ${addr.street}, ${addr.city}, ${addr.state}, ${addr.zip}, ${addr.country}`);
      }
    } else {
      setLoading(false);
    }
  }, [location.state]);
  

  const totalAmount = cartItems.reduce((sum, item) => sum + item.productId.discountPrice * item.quantity, 0);

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
      const { data } = await api.post('/payment/create-razorpay-order', { amount: totalAmount * 100 });

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

          const result = await api.post('/payment/verify-razorpay-payment', paymentData);

          if (result.data.status === 'success') {
            setLoading(true);
            try {
              // Clear the cart
              await api.post('/cart/clear');
              dispatch(clearCart());
              // Send order details
              await sendOrder(location.state.selectedAddress, totalAmount, cartItems);
              // Mark payment as successful
              setSucceeded(true);
              setError(null);
              // Set loading to false before navigating to another page
              setLoading(false);
              // Navigate to payment success page
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
            } catch (err) {
              setError('Something went wrong while processing your order. Please try again.');
              setLoading(false); // Ensure loading is stopped even if an error occurs
            }
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
      
      {/* Trust Section */}
      <div className="payment-trust-section">
        <div className="payment-trust-icons">
          <div className="payment-trust-item">
            <FontAwesomeIcon icon={faLock} className="payment-trust-item-icon" /> SSL Secured
          </div>
          <div className="payment-trust-item">
            <FontAwesomeIcon icon={faShieldAlt} className="payment-trust-item-icon" /> 100% Secure Payment
          </div>
          <div className="payment-trust-item">
            <FontAwesomeIcon icon={faUserSecret} className="payment-trust-item-icon" /> Privacy Protected
          </div>
        </div>
        <p className="security-info">We don’t save your payment details for security purposes. Your information is encrypted and secured.</p>
      </div>

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input 
          type="text" 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)} 
          required 
          disabled
          autoComplete='name'
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
          autoComplete='email'
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
          autoComplete='tel'
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
          autoComplete='street-address'
        />
      </div>

      {/* Payment Method Icons */}
      <div className="payment-method-icons">
        <FontAwesomeIcon icon={faCcVisa} className="payment-icon" title="Visa" />
        <FontAwesomeIcon icon={faCcMastercard} className="payment-icon" title="MasterCard" />
        <FontAwesomeIcon icon={faGooglePay} className="payment-icon" title="Google Pay" />
        <FontAwesomeIcon icon={faCreditCard} className="payment-icon" title="Credit Card" />
        <FontAwesomeIcon icon={faMoneyCheckAlt} className="payment-icon" title="Bank Transfer" />
        <FontAwesomeIcon icon={faUniversity} className="payment-icon" title="Net Banking" />
        <FontAwesomeIcon icon={faWallet} className="payment-icon" title="Wallet" />
      </div>

      {/* SSL Certification Badge */}
      <div className="ssl-secure">
        <FontAwesomeIcon icon={faLock} className="icon" />
        <p>Your connection is SSL secured.</p>
      </div>

      {/* Money-Back Guarantee */}
      <div className="money-back-guarantee">
        <FontAwesomeIcon icon={faShieldAlt} className="icon" />
        <p>7-day Money-Back Guarantee</p>
      </div>

      {/* Contact Information */}
      <div className="contact-info">
        <p>
          <FontAwesomeIcon icon={faEnvelope} className="icon-margin" /> Need Help? Contact us at 
          <a href="mailto:contact@himalayanrasa.com"> contact@himalayanrasa.com </a> 
          or <FontAwesomeIcon icon={faPhone} className="icon-margin" /> call +91-8588-904-438.
        </p>
      </div>

      <button type="submit" className="pay-button" disabled={processing || succeeded} onClick={handleSubmit}>
        {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faLock} className="icon-margin" /> Order Now</>}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

const Payment = () => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
        <p>Yay! Your order is scaling the Himalayan peaks...</p>
        <p>Soon, your treasures will arrive at your doorstep!</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment - Ħimalayan R̥asa</title>
      </Helmet>
      <div className="payment-page">
        <div className="payment-container">
          <h1>Checkout</h1>
          <PaymentForm setLoading={setLoading} />
        </div>
      </div>
    </>
  );
};

export default Payment;
