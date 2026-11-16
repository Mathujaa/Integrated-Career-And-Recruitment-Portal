import React from 'react';
import '../styles/components.css';

const Input = ({ 
  label, 
  id, 
  error, 
  className = '', 
  type = 'text', 
  rightElement,
  style,
  ...props 
}) => {
  return (
    <div className={`input-group ${className}`} style={style}>
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
          style={rightElement ? { paddingRight: '44px' } : undefined}
          {...props}
        />
        {rightElement && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
