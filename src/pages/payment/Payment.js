import React, { useState, useEffect, lazy, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faLock, faShieldAlt, faUserSecret, faUniversity, faMoneyCheckAlt, faWallet, faCreditCard, faEnvelope, faPhone, faShoppingCart, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faCcVisa, faCcMastercard, faGooglePay } from '@fortawesome/free-brands-svg-icons';
import api from '../../services/api';
import { clearCart } from '../../redux/actions/cartActions';
import CheckoutProgress from '../../utils/progressbar/CheckoutProgress';
import './Payment.css';

const Popup = lazy(() => import('../../utils/alert/Popup'));

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const sendOrder = async (billingAddress, shippingAddress, totalAmount, cartItems, recommendedCourierId, paymentMethod) => {
  const newPaymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Paid';
  try {
    await api.post('/orders/order', {
      billingAddress,
      shippingAddress,
      cartItems,
      totalAmount,
      paymentStatus: newPaymentStatus,
      recommendedCourierId,
      paymentMethod
    });
  } catch (error) {
    console.error('Error sending order');
  }
};

const PaymentForm = () => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [recommendedCourierId, setRecommendedCourierId] = useState('');
  const [paymentMode, setPaymentMode] = useState('online');
  const shippingAddressPinCode = location?.state?.selectedShippingAddress?.zip;


  // Memoize the total weight to prevent recalculation on each render
  const totalWeight = useMemo(() => {
    return cartItems.reduce((totalWeight, item) => totalWeight + (item.weight || 1), 0) || 1;
  }, [cartItems]);

  // Function to fetch shipping details with debounce to prevent multiple API calls
  const fetchShippingDetails = useMemo(
    () =>
      debounce(async () => {
        if (!shippingAddressPinCode || !totalWeight) return; // Ensure we have required params
        try {
          const response = await api.get('/orders/shiprocket/serviceability', {
            params: {
              pickupPostcode: '201318', // Your warehouse postcode
              deliveryPostcode: shippingAddressPinCode, // Use the selected address's pincode
              weight: totalWeight, // Use memoized total weight
              cod: 0 // Adjust based on your COD setting
            }
          });

          const courierData = response.data?.best5Couriers;
          if (courierData) {
            const recommendedCourier = courierData.find(courier => courier.isRecommended);
            setRecommendedCourierId(recommendedCourier.courier_company_id);
          }
        } catch (error) {
          console.error('Failed to fetch shipping details:', error);
        } finally {
          setLoading(false);
        }
      }, 500), // Debounce for 500ms
    [shippingAddressPinCode, totalWeight] // Dependencies for memoized function
  );

  // Fetch user profile when the component mounts if the user is authenticated.
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setEmail(data?.email || '');
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  // Trigger fetchShippingDetails only when shippingAddressPinCode or totalWeight changes
  useEffect(() => {
    if (shippingAddressPinCode && totalWeight) {
      fetchShippingDetails();
    }

    // Clean up debounced function on unmount
    return () => {
      fetchShippingDetails.cancel();
    };
  }, [shippingAddressPinCode, totalWeight, fetchShippingDetails]);

  // Set selected address when location.state changes.
  useEffect(() => {
    if (location?.state?.selectedBillingAddress) {
      const billingAddr = location.state.selectedBillingAddress;
      setName(`${billingAddr.firstName} ${billingAddr.lastName}`);
      setContact(billingAddr.phoneNumber || '');
      setBillingAddress(`${billingAddr.flat}, ${billingAddr.street}, ${billingAddr.city}, ${billingAddr.state}, ${billingAddr.zip}, ${billingAddr.country}`);
    }

    if (location?.state?.selectedShippingAddress) {
      const shippingAddr = location.state.selectedShippingAddress;
      setShippingAddress(`${shippingAddr.flat}, ${shippingAddr.street}, ${shippingAddr.city}, ${shippingAddr.state}, ${shippingAddr.zip}, ${shippingAddr.country}`);
    }

  }, [location.state]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.productId.discountPrice * item.quantity, 0);

  // Payment mode selection component with modern card-style design
  const PaymentModeToggle = () => (
    <div className="payment-mode-toggle-modern-cards">
      <div
        className={`payment-mode-card ${paymentMode === 'online' ? 'active-card' : ''}`}
        onClick={() => setPaymentMode('online')}
      >
        <div className="card-content">
          <FontAwesomeIcon icon={faCreditCard} className="card-icon" />
          <h3>Pay Online</h3>
          <p>Use your Card, Net Banking, UPI, or wallet</p>
          {paymentMode === 'online' && (
          <FontAwesomeIcon icon={faCheckCircle} className="tick-icon" />  // Show tick when selected
        )}
        </div>
      </div>
      <div
        className={`payment-mode-card ${paymentMode === 'cod' ? 'active-card' : ''}`}
        onClick={() => setPaymentMode('cod')}
      >
        <div className="card-content">
          <FontAwesomeIcon icon={faMoneyCheckAlt} className="card-icon" />
          <h3>Cash on Delivery</h3>
          <p>Pay when the product is delivered</p>
          {paymentMode === 'cod' && (
          <FontAwesomeIcon icon={faCheckCircle} className="tick-icon" />  // Show tick when selected
        )}
        </div>
      </div>
    </div>
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!name || !email || !contact || !billingAddress) {
      setError('Please fill in all the required fields.');
      setProcessing(false);
      return;
    }

    if (paymentMode === 'cod') {
      // Handle COD (skip Razorpay)
      try {
        setLoading(true);
        await api.post('/cart/clear');
        await sendOrder(
          location.state.selectedBillingAddress, 
          location.state.selectedShippingAddress, 
          totalAmount, 
          cartItems, 
          recommendedCourierId, 
          'COD'
        );
        setSucceeded(true);
        setError(null);
        dispatch(clearCart());
        setProcessing(false);
        setLoading(false);
        // Redirect to payment success page
        navigate('/payment-success', {
          state: {
            orderId: `COD-${Date.now()}`, // Mock Order ID for COD
            amount: totalAmount,
            name: name,
            contact: contact,
            address: location.state.selectedShippingAddress,
            cartItems: cartItems,
            paymentMethod: 'COD'
          }
        });
      } catch (err) {
        setError('Something went wrong while processing your order. Please try again.');
        setShowPopup(true);
        setProcessing(false);
        setLoading(false);
      }
    } else {
      // Proceed with Razorpay for online payment
      const res = await loadRazorpay();

      if (!res) {
        setError('Razorpay SDK failed to load. Are you online?');
        setShowPopup(true);
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
                await api.post('/cart/clear');
                await sendOrder(
                  location.state.selectedBillingAddress, 
                  location.state.selectedShippingAddress, 
                  totalAmount, 
                  cartItems, 
                  recommendedCourierId, 
                  'Prepaid'
                );
                setSucceeded(true);
                setError(null);
                dispatch(clearCart());
                setProcessing(false);
                setLoading(false);
                navigate('/payment-success', {
                  state: {
                    orderId: data.id,
                    amount: totalAmount,
                    name: name,
                    contact: contact,
                    address: location.state.selectedShippingAddress,
                    cartItems: cartItems,
                    paymentMethod: 'Online'
                  }
                });
              } catch (err) {
                setError('Something went wrong while processing your order. Please try again.');
                setShowPopup(true);
                setProcessing(false);
                setLoading(false);
              }
            } else {
              setError('Payment verification failed. Please contact support.');
              setShowPopup(true);
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
        setShowPopup(true);
        setProcessing(false);
      }
    }

    setProcessing(false);
  };


  const handleBackToAddress = () => {
    navigate('/addresses');
  };

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
      {showPopup && (
        <Suspense fallback={<div>Loading popup...</div>}>
          <Popup
            message={error}
            onClose={() => setShowPopup(false)}
          />
        </Suspense>
      )}

      {/* Payment Form (checkout) */}
      <div className="payment-form">
        <h1>Checkout</h1>
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

        <PaymentModeToggle />

        {/* Form fields for payment */}
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
          <label htmlFor="billing-address">Billing Address</label>
          <textarea
            id="billing-address"
            value={billingAddress || ''}
            onChange={(e) => setBillingAddress(e.target.value)}
            required
            rows="3"
            disabled
            autoComplete='street-address'
          />
        </div>
        <div className="form-group">
          <label htmlFor="shipping-address">Shipping Address</label>
          <textarea
            id="shipping-address"
            value={shippingAddress || ''}
            onChange={(e) => setShippingAddress(e.target.value)}
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

        <div className="payemnt-page-button-group">
          <button className="payment-back-button" onClick={handleBackToAddress}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className='icon-margin' /> Back to Address
          </button>
          <button type="submit" className="pay-button" disabled={processing || succeeded} onClick={handleSubmit}>
            {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faLock} className="icon-margin" /> Order Now</>}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
};

const Payment = () => {
  return (
    <>
      <Helmet>
        <title>Payment - Ħimalayan R̥asa</title>
      </Helmet>
      {/* Integrating CheckoutProgress Component */}
      <CheckoutProgress currentStep={3} />
      <div className="payment-page">
        <div className="payment-container">
          <PaymentForm />
        </div>
      </div>
    </>
  );
};

export default Payment;
