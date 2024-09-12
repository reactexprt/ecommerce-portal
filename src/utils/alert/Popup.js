import React, { useState } from 'react';
import './Popup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Popup = ({ message, onClose, onConfirm, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = async (callback) => {
    setIsLoading(true); // Set loading to true when the button is clicked
    try {
      await callback(); // Wait for the callback (onClose, onConfirm, or onCancel)
    } catch (error) {
      console.error("An error occurred:", error);
    }
    setIsLoading(false); // Set loading back to false after the operation completes
  };

  return (
    <div className="popup-backdrop">
      <div className="popup-container">
        <p>{message}</p>
        <div className="popup-buttons">
          {/* If onConfirm is passed, show confirm and cancel buttons */}
          {onConfirm && onCancel ? (
            <>
              <button 
                className="popup-button" 
                onClick={() => handleButtonClick(onConfirm)}
                disabled={isLoading} // Disable button when loading
              >
                {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Okay'}
              </button>
              <button 
                className="popup-button popup-cancel" 
                onClick={() => handleButtonClick(onCancel)}
                disabled={isLoading} // Disable button when loading
              >
                {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Cancel'}
              </button>
            </>
          ) : (
            /* If only onClose is passed, show only the close (Okay) button */
            <button 
              className="popup-button" 
              onClick={() => handleButtonClick(onClose)}
              disabled={isLoading} // Disable button when loading
            >
              {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Okay'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
