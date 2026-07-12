import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import '../styles/pages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  const { forgotPassword } = useAuth();

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Email address is required.');
      return;
    }

    setLoadingState(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await forgotPassword(email);
      setSuccessMsg(response.message || 'If this matches an active account, a password reset link will be sent.');
    } catch (err) {
      setErrorMsg(err);
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <Link to="/" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', display: 'inline-block' }}>
            💼 CareerPortal
          </Link>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Input your email address to receive a secure recovery verification link</p>
        </div>

        <form onSubmit={handleForgotSubmit}>
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={loadingState}>
            Send Recovery Email
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Remember your password?{' '}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="toast-container">
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
        </div>
      )}

      {successMsg && (
        <div className="toast-container">
          <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
