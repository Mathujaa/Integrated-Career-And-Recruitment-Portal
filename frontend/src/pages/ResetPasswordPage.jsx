import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import '../styles/pages.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Invalid or missing password recovery verification token.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoadingState(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await resetPassword(token, password);
      setSuccessMsg('Your password has been successfully updated. Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
          <h2 className="auth-title">Configure New Password</h2>
          <p className="auth-subtitle">Input your new security password below</p>
        </div>

        <form onSubmit={handleResetSubmit}>
          <Input
            label="New Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={loadingState}>
            Update Password
          </Button>
        </form>
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

export default ResetPasswordPage;
