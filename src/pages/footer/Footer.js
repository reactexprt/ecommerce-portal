import React, { Suspense, lazy } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faTwitter, faCcVisa, faCcMastercard, faGooglePay } from '@fortawesome/free-brands-svg-icons';
import { faUniversity, faMoneyCheckAlt, faWallet, faCreditCard, faSpinner } from '@fortawesome/free-solid-svg-icons'; 
import './Footer.css';

// Lazy-load the components
const AboutUsButton = lazy(() => import('../../components/about/AboutUsButton'));
const ContactUsButton = lazy(() => import('../../components/contactUs/ContactUsButton'));
const ShippingInformationButton = lazy(() => import('../../components/shippingInformation/ShippingInformationButton'));
const ReturnsExchangesButton = lazy(() => import('../../components/returnExchanges/ReturnsExchangesButton'));
const FAQsButton = lazy(() => import('../../components/faqs/FAQsButton'));
const TermsAndConditionsButton = lazy(() => import('../../components/termsAndConditions/TermsAndConditionsButton'));
const PrivacyPolicyButton = lazy(() => import('../../components/privacyPolicy/PrivacyPolicyButton'));
const ReturnPolicyButton = lazy(() => import('../../components/returnPolicy/ReturnPolicyButton'));

const Spinner = () => (
  <div className="spinner-container">
    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="common-loading-spinner" />
    <p>Loading, please wait...</p>
  </div>
);

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about-us">
          <h2>About Us</h2>
          <p className='common-text-color'>Himalayan Rasa is your one-stop shop for natural and organic products sourced directly from the pristine Himalayan mountains. Our mission is to provide quality products that enhance your well-being.</p>
          <Suspense fallback={<Spinner />}>
            <AboutUsButton />
          </Suspense>
        </div>

        <div className="footer-section customer-service">
          <h2>Customer Service</h2>
          <ul className='customer-service-list'>
            <Suspense fallback={<Spinner />}>
              <ContactUsButton />
              <ShippingInformationButton />
              <ReturnsExchangesButton />
              <FAQsButton />
            </Suspense>
          </ul>
        </div>

        <div className="footer-section legal">
          <h2>Legal</h2>
          <ul className='legal-list'>
            <Suspense fallback={<Spinner />}>
              <TermsAndConditionsButton />
              <PrivacyPolicyButton />
              <ReturnPolicyButton />
            </Suspense>
          </ul>
        </div>

        <div className="footer-section connect">
          <h2>Connect with Us</h2>
          <div className="social-media-icons">
            <a href="https://www.facebook.com/yourpage" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faFacebookF} className="social-icon" />
            </a>
            <a href="https://www.instagram.com/yourpage" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} className="social-icon" />
            </a>
            <a href="https://twitter.com/yourpage" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faTwitter} className="social-icon" />
            </a>
          </div>
          <form className="newsletter-form">
            <label htmlFor="newsletter">Subscribe to our newsletter</label>
            <input type="email" id="newsletter" placeholder="Your email address" autoComplete='email' />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        <div className="footer-section footer-payment-methods">
          <h2>Payment Methods</h2>
          <div className="payment-icons">
            <FontAwesomeIcon icon={faCreditCard} className="payment-icon" title="Credit Cards" />
            <FontAwesomeIcon icon={faCcVisa} className="payment-icon" title="Visa" />
            <FontAwesomeIcon icon={faCcMastercard} className="payment-icon" title="MasterCard" />
            <FontAwesomeIcon icon={faUniversity} className="payment-icon" title="Net Banking" />
            <FontAwesomeIcon icon={faMoneyCheckAlt} className="payment-icon" title="UPI" />
            <FontAwesomeIcon icon={faGooglePay} className="payment-icon" title="Google Pay" />
            <FontAwesomeIcon icon={faWallet} className="payment-icon" title="Wallets" />
          </div>
        </div>

        <div className="footer-section footer-contact-info">
          <h2>Contact Information</h2>
          <p className='common-text-color'>Rangri Road, Sarsai, Manali</p>
          <p className='common-text-color'>Email: contact@himalayanrasa.com</p>
          <p className='common-text-color'>Phone: +91-8588-90-4438</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Ħimalayan R̥asa. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
