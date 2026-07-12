import React from 'react';
import Spinner from '../components/Spinner';

const LoadingScreen = () => {
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      gap: '16px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <Spinner size="lg" />
      <p style={{
        fontWeight: 600,
        color: 'var(--text-muted)',
        fontSize: '1rem',
        letterSpacing: '0.5px'
      }}>
        Loading CareerPortal...
      </p>
    </div>
  );
};

export default LoadingScreen;
