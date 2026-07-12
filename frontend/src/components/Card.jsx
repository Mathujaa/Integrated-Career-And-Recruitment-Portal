import React from 'react';
import '../styles/components.css';

const Card = ({ children, className = '', onClick, ...props }) => {
  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
