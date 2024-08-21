import React, { useState } from 'react';
import Modal from '../../utils/modal/Modal'; // Adjust the path according to your folder structure

const PrivacyPolicyButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <button className='common-modal-button' onClick={handleOpenModal}>Privacy Policy</button>
      <Modal show={showModal} onClose={handleCloseModal}>
        <h2>Privacy Policy</h2>
        <p>
          At Himalayan Rasa, we are committed to protecting your privacy. This Privacy Policy outlines the types of information we collect, how we use it, and the steps we take to ensure it is protected.
        </p>

        <h3>1. Information We Collect</h3>
        <p>
          We collect information that you provide to us directly, such as when you create an account, place an order, or contact customer support. This may include your name, email address, phone number, shipping address, and payment information.
        </p>

        <h3>2. How We Use Your Information</h3>
        <p>
          We use your information to process orders, provide customer support, and improve our services. We may also use your information to send promotional emails, but you can opt out of these communications at any time.
        </p>

        <h3>3. Sharing Your Information</h3>
        <p>
          We do not share your personal information with third parties except as necessary to process your order or as required by law. We may share your information with service providers who assist us with order fulfillment, payment processing, and marketing.
        </p>

        <h3>4. Data Security</h3>
        <p>
          We take the security of your information seriously and implement a variety of security measures to protect your data. This includes encryption, secure servers, and regular security audits.
        </p>

        <h3>5. Cookies</h3>
        <p>
          Our website uses cookies to improve your browsing experience. Cookies are small files that are stored on your device and help us recognize you when you return to our site. You can disable cookies in your browser settings, but this may affect your ability to use certain features of our site.
        </p>

        <h3>6. Your Rights</h3>
        <p>
          You have the right to access, update, or delete your personal information at any time. If you wish to exercise these rights, please contact us at [Your Contact Information].
        </p>

        <h3>7. Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Any updates will be posted on this page.
        </p>

        <p>
          If you have any questions about our Privacy Policy, please contact us at [Your Contact Information].
        </p>
      </Modal>
    </>
  );
};

export default PrivacyPolicyButton;
