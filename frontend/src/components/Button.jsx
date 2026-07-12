import React from 'react';
import '../styles/components.css';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  fullWidth = false, 
  loading = false, 
  disabled = false, 
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="spinner-ring spinner-sm" style={{ borderLeftColor: 'currentColor' }}></span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
