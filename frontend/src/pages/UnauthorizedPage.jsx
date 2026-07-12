import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import '../styles/pages.css';

const UnauthorizedPage = () => {
  return (
    <div className="auth-container" style={{ textAlign: 'center' }}>
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '16px' }}>🚫</div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '12px' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
          You do not have the required permissions to access this page. Please log in with a different account or return to the homepage.
        </p>
        <Link to="/">
          <Button variant="primary">Go to Homepage</Button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
