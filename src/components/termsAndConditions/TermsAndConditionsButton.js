import React, { useState } from 'react';
import Modal from '../../utils/modal/Modal'; // Adjust the path according to your folder structure

const TermsAndConditionsButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <button className='common-modal-button' onClick={handleOpenModal}>Terms & Conditions</button>
      <Modal show={showModal} onClose={handleCloseModal}>
        <h2>Terms & Conditions</h2>
        <p>
          Welcome to Himalayan Rasa! These terms and conditions outline the rules and regulations for the use of our website and services.
        </p>

        <h3>1. Introduction</h3>
        <p>
          By accessing our website or purchasing our products, you agree to be bound by these terms and conditions. If you do not agree with any part of the terms, please do not use our services.
        </p>

        <h3>2. Intellectual Property</h3>
        <p>
          All content on this site, including text, graphics, logos, images, and software, is the property of Himalayan Rasa or its content suppliers and is protected by international copyright laws. Unauthorized use of any content may violate copyright, trademark, and other laws.
        </p>

        <h3>3. User Accounts</h3>
        <p>
          If you create an account on our site, you are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
        </p>

        <h3>4. Product Information</h3>
        <p>
          We strive to ensure that all product descriptions and prices are accurate. However, we do not warrant that the product descriptions or other content is error-free. In the event of an error, we reserve the right to correct it and revise your order accordingly.
        </p>

        <h3>5. Payment</h3>
        <p>
          All payments must be made through our authorized payment processors. We do not store your payment information on our servers. Any issues with payment processing should be directed to the payment processor.
        </p>

        <h3>6. Shipping & Delivery</h3>
        <p>
          We will make every effort to deliver your order within the estimated time frame. However, delays may occur due to unforeseen circumstances. We are not liable for any delays in delivery.
        </p>

        <h3>7. Returns & Refunds</h3>
        <p>
          Please refer to our Refund Policy for detailed information about returns and refunds.
        </p>

        <h3>8. Limitation of Liability</h3>
        <p>
          To the fullest extent permitted by law, Himalayan Rasa shall not be liable for any damages arising from the use of our website or products. This includes direct, indirect, incidental, or consequential damages.
        </p>

        <h3>9. Governing Law</h3>
        <p>
          These terms and conditions are governed by the laws of [Your Country/State]. Any disputes arising out of the use of our website or products shall be resolved in the courts of [Your Country/State].
        </p>

        <h3>10. Changes to the Terms</h3>
        <p>
          We reserve the right to update these terms and conditions at any time. Any changes will be posted on this page, and it is your responsibility to review the terms regularly.
        </p>

        <p>
          If you have any questions about these Terms & Conditions, please contact us at [Your Contact Information].
        </p>
      </Modal>
    </>
  );
};

export default TermsAndConditionsButton;
