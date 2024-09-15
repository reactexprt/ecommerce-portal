import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faMapMarkerAlt, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import './CheckoutProgress.css';

const CheckoutProgress = ({ currentStep }) => {
  return (
    <div className="checkout-progress">
      <ul>
        <li className={`step ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}`}>
          <span className="icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </span>
          <span className="label">Cart</span>
        </li>
        <li className={`step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}`}>
          <span className="icon">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
          </span>
          <span className="label">Address</span>
        </li>
        <li className={`step ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}`}>
          <span className="icon">
            <FontAwesomeIcon icon={faCreditCard} />
          </span>
          <span className="label">Checkout</span>
        </li>
      </ul>
    </div>
  );
};

export default CheckoutProgress;
