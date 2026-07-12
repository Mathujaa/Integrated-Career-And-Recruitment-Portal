import React, { useEffect } from 'react';
import '../styles/components.css';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✔';
      case 'error':
        return '✖';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast-item toast-${type}`}>
      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{getIcon()}</span>
      <span className="toast-msg">{message}</span>
      <button className="toast-close" onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

export default Toast;
