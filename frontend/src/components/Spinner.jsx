import React from 'react';
import '../styles/components.css';

const Spinner = ({ size = 'md', className = '' }) => {
  return <div className={`spinner-ring spinner-${size} ${className}`}></div>;
};

export default Spinner;
