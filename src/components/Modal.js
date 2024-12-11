import React from 'react';
import '../componentsCSS/Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div className="modal-content-wrapper">
          <div className="modal-form-container">
            {children}
          </div>
          <div className="modal-footer">
            {/* Tu możesz dodać dodatkowe elementy stopki, jeśli chcesz */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;