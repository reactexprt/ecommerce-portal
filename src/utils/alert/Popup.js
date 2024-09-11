import React from 'react';
import './Popup.css';

const Popup = ({ message, onClose, onConfirm, onCancel }) => {
  return (
    <div className="popup-backdrop">
      <div className="popup-container">
        <p>{message}</p>
        <div className="popup-buttons">
          {/* If onConfirm is passed, show confirm and cancel buttons */}
          {onConfirm && onCancel ? (
            <>
              <button className="popup-button" onClick={onConfirm}>
                Okay
              </button>
              <button className="popup-button popup-cancel" onClick={onCancel}>
                Cancel
              </button>
            </>
          ) : (
            /* If only onClose is passed, show only the close (Okay) button */
            <button className="popup-button" onClick={onClose}>
              Okay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
