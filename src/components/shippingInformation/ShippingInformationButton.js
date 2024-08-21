import React, { useState } from 'react';
import Modal from '../../utils/modal/Modal'; // Adjust the path according to your folder structure

const ShippingInformationButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <button onClick={handleOpenModal} className='common-modal-button'>Shipping Information</button>
      <Modal show={showModal} onClose={handleCloseModal}>
        <h2>Shipping Information</h2>
        <p>
          We offer fast and reliable shipping to ensure your products reach you in perfect condition. All orders are processed within 2-3 business days and shipped via trusted carriers.
        </p>
        <p>
          <strong>Shipping Rates:</strong> We offer flat-rate shipping for all orders. Free shipping is available for orders over a certain amount.
        </p>
        <p>
          <strong>Delivery Time:</strong> Estimated delivery times vary by location. Typically, deliveries take 5-7 business days within the country.
        </p>
      </Modal>
    </>
  );
};

export default ShippingInformationButton;
