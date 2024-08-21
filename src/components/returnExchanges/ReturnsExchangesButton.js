import React, { useState } from 'react';
import Modal from '../../utils/modal/Modal'; // Adjust the path according to your folder structure

const ReturnsExchangesButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <button onClick={handleOpenModal} className='common-modal-button'>Returns & Exchanges</button>
      <Modal show={showModal} onClose={handleCloseModal}>
        <h2>Returns & Exchanges</h2>
        <p>
          Your satisfaction is our priority. If you're not completely satisfied with your purchase, we're here to help with our hassle-free return and exchange policy.
        </p>
        <p>
          <strong>Returns:</strong> You can return any item within 30 days of purchase. Items must be in their original condition with all tags attached.
        </p>
        <p>
          <strong>Exchanges:</strong> If you need a different size or color, we offer easy exchanges. Just return the item and place a new order for the desired product.
        </p>
        <p>
          For more details, please contact our customer service team.
        </p>
      </Modal>
    </>
  );
};

export default ReturnsExchangesButton;
