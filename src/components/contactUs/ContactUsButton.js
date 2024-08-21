import React, { useState } from 'react';
import Modal from '../../utils/modal/Modal'; // Adjust the path according to your folder structure

const ContactUsButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <button onClick={handleOpenModal} className='common-modal-button'>Contact Us</button>
      <Modal show={showModal} onClose={handleCloseModal} title="Contact Us">
        <p>
          We're here to help! If you have any questions, concerns, or feedback, please don't hesitate to reach out to us. 
          Our team is committed to providing excellent customer service and we'll do our best to respond as quickly as possible.
        </p>
        <p>
          <strong>Email:</strong> support@himalayanrasa.com
        </p>
        <p>
          <strong>Phone:</strong> +123 456 7890
        </p>
        <p>
          <strong>Address:</strong> 123 Himalayan Rasa Street, City, Country
        </p>
      </Modal>
    </>
  );
};

export default ContactUsButton;
