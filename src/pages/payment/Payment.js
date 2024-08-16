// src/pages/Payment.js
import React, { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useSelector } from 'react-redux';
import { Elements } from '@stripe/react-stripe-js';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import './Payment.css';

const stripePromise = loadStripe('your-publishable-key-here');

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const cartItems = useSelector(state => state.cart.cartItems); 
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    try {
      let paymentIntent;

      if (paymentMethod === 'card') {
        const { data } = await api.post('/create-payment-intent', { amount: totalAmount * 100 }); // Amount in cents
        paymentIntent = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        });
      } else if (paymentMethod === 'netBanking') {
        // Handle net banking payment process
      } else if (paymentMethod === 'upi') {
        // Handle UPI payment process
      }

      if (paymentIntent?.error) {
        setError(paymentIntent.error.message);
      } else if (paymentIntent?.paymentIntent?.status === 'succeeded') {
        setSucceeded(true);
        setError(null);
      }
    } catch (error) {
      setError(error.message);
    }

    setProcessing(false);
  };

  return (
    <div className="payment-form">
      <h2>Complete Your Payment</h2>
      <div className="total-amount">Total Amount: ₹{totalAmount.toFixed(2)}</div>
      <div className="payment-methods">
        <button
          className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
          onClick={() => handlePaymentMethodChange('card')}
        >
          Card Payment
        </button>
        <button
          className={`payment-method ${paymentMethod === 'netBanking' ? 'selected' : ''}`}
          onClick={() => handlePaymentMethodChange('netBanking')}
        >
          Net Banking
        </button>
        <button
          className={`payment-method ${paymentMethod === 'upi' ? 'selected' : ''}`}
          onClick={() => handlePaymentMethodChange('upi')}
        >
          UPI
        </button>
      </div>

      {paymentMethod === 'card' && (
        <div className="card-payment-section">
          <div className="card-logos">
            <img src="/images/visa.png" alt="Visa" />
            <img src="/images/mastercard.png" alt="MasterCard" />
            <img src="/images/amex.png" alt="Amex" />
          </div>
          <div className="form-group">
            <label htmlFor="card-element">Card Information</label>
            <CardElement id="card-element" className="card-element" />
          </div>
        </div>
      )}

      {paymentMethod === 'netBanking' && (
        <div className="form-group">
          <label htmlFor="net-banking">Select Bank</label>
          <select id="net-banking" className="input-field">
            <option value="bank1">Bank 1</option>
            <option value="bank2">Bank 2</option>
            <option value="bank3">Bank 3</option>
            {/* Add more bank options as needed */}
          </select>
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="form-group">
          <label htmlFor="upi-id">UPI ID</label>
          <input type="text" id="upi-id" placeholder="example@upi" className="input-field" />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      <button type="submit" className="pay-button" disabled={processing || succeeded} onClick={handleSubmit}>
        {processing ? "Processing..." : "Pay Now"}
      </button>
      {succeeded && <div className="success-message">Payment succeeded!</div>}
    </div>
  );
};

const Payment = () => {
  return (
    <>
      <Helmet>
        <title>Paymenʈ - Ħimalayan R̥asa</title>
      </Helmet>
      <Elements stripe={stripePromise}>
        <div className="payment-page">
          <div className="payment-container">
            <h1>Checkout</h1>
            <PaymentForm />
          </div>
        </div>
      </Elements>
    </>
  );
};

export default Payment;
