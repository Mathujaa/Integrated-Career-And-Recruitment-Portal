import React, { useEffect } from 'react';
import '../styles/components.css';

const Modal = ({ isOpen, onClose, title, children, footerActions }) => {
  // Lock body scroll when the modal is rendered active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ margin: 0 }}>
            {title}
          </h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footerActions && <div className="modal-footer">{footerActions}</div>}
      </div>
    </div>
  );
};

export default Modal;
