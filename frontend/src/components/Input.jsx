import React from 'react';
import '../styles/components.css';

const Input = ({ 
  label, 
  id, 
  error, 
  className = '', 
  type = 'text', 
  ...props 
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        <input
          type={type}
          id={id}
          className={`input-field ${error ? 'input-error-border' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
