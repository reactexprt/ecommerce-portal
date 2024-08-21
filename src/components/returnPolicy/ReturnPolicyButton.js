import React, { useState } from 'react';
import Modal from '../../utils/modal/Modal'; // Adjust the path according to your folder structure

const RefundPolicyButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <button className='common-modal-button' onClick={handleOpenModal}>Refund Policy</button>
      <Modal show={showModal} onClose={handleCloseModal}>
        <h2>Refund Policy</h2>
        <p>
          At Himalayan Rasa, we stand behind the quality of our products and want you to be completely satisfied with your purchase. If you are not satisfied, we offer the following refund policy.
        </p>

        <h3>1. Eligibility for Refunds</h3>
        <p>
          To be eligible for a refund, the following conditions must be met:
          <ul>
            <li>The item must be unused and in the same condition that you received it.</li>
            <li>The item must be returned in its original packaging.</li>
            <li>The request for a refund must be made within 30 days of the purchase date.</li>
          </ul>
        </p>

        <h3>2. Non-Refundable Items</h3>
        <p>
          Certain items are non-refundable, including:
          <ul>
            <li>Gift cards</li>
            <li>Downloadable software products</li>
            <li>Perishable goods such as food, flowers, newspapers, or magazines</li>
          </ul>
        </p>

        <h3>3. How to Request a Refund</h3>
        <p>
          To request a refund, please contact our customer service team at [Your Contact Information] with your order number and details about the product you wish to return. We will respond with instructions on how to proceed with the return.
        </p>

        <h3>4. Processing Refunds</h3>
        <p>
          Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within a certain amount of days.
        </p>

        <h3>5. Late or Missing Refunds</h3>
        <p>
          If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted. If you’ve done all of this and you still have not received your refund, please contact us at [Your Contact Information].
        </p>

        <h3>6. Exchanges</h3>
        <p>
          We only replace items if they are defective or damaged. If you need to exchange it for the same item, please contact us at [Your Contact Information].
        </p>

        <p>
          If you have any questions about our Refund Policy, please contact us at [Your Contact Information].
        </p>
      </Modal>
    </>
  );
};

export default RefundPolicyButton;
