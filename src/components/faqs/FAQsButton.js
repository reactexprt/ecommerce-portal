import React, { useState } from 'react';
import Modal from '../../utils/modal/Modal'; // Adjust the path according to your folder structure

const FAQsButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <button onClick={handleOpenModal} className='common-modal-button'>FAQs</button>
      <Modal show={showModal} onClose={handleCloseModal}>
        <h2>Frequently Asked Questions (FAQs)</h2>
        <p>
          Here are some of the most common questions our customers ask. If you don't find the answer you're looking for, please contact us directly.
        </p>
        <p>
          <strong>Q:</strong> What payment methods do you accept?<br />
          <strong>A:</strong> We accept all major credit cards, PayPal, and bank transfers.
        </p>
        <p>
          <strong>Q:</strong> How can I track my order?<br />
          <strong>A:</strong> Once your order is shipped, you'll receive an email with the tracking information.
        </p>
        <p>
          <strong>Q:</strong> Can I change or cancel my order?<br />
          <strong>A:</strong> Orders can be changed or canceled within 24 hours of placing the order. Please contact customer service for assistance.
        </p>
        <p>
          <strong>Q:</strong> Do you offer international shipping?<br />
          <strong>A:</strong> Yes, we ship to selected countries. Please check our Shipping Information page for more details.
        </p>
      </Modal>
    </>
  );
};

export default FAQsButton;
