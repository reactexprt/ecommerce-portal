import React from 'react';
import './Modal.css';

const Modal = ({ show, onClose, children, title }) => {
  if (!show) return null;

  return (
    <div className="common-modal-overlay" onClick={onClose}>
      <div className="common-modal-content" onClick={e => e.stopPropagation()}>
        <button className="common-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="common-modal-header">
          <h2>{title}</h2>
        </div>
        <div className="common-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
