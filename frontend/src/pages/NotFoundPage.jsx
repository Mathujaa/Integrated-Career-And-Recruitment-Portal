import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import '../styles/pages.css';

const NotFoundPage = () => {
  return (
    <div className="auth-container" style={{ textAlign: 'center' }}>
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '12px' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
          Oops! The page you are looking for does not exist or has been moved. Check the URL or click the button below to go back home.
        </p>
        <Link to="/">
          <Button variant="primary">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
