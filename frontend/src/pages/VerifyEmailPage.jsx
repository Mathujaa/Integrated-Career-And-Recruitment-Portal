import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import '../styles/pages.css';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [tokenInput, setTokenInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { verifyEmail } = useAuth();

  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleVerify = async (tokenToUse) => {
    setVerifying(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await verifyEmail(tokenToUse);
      setSuccessMsg('Your email address has been verified successfully! You can now log in.');
    } catch (err) {
      setErrorMsg(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!tokenInput) {
      setErrorMsg('Please input a verification token.');
      return;
    }
    handleVerify(tokenInput);
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <Link to="/" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', display: 'inline-block' }}>
            💼 CareerPortal
          </Link>
          <h2 className="auth-title">Verify Email</h2>
          <p className="auth-subtitle">Verify your email address to activate your account</p>
        </div>

        {verifying ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
            <Spinner size="md" />
            <p style={{ color: 'var(--text-muted)' }}>Verifying email token...</p>
          </div>
        ) : successMsg ? (
          <div style={{ padding: '16px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--success)' }}>✔</div>
            <p style={{ color: 'var(--text-main)', fontWeight: 500, marginBottom: '24px', lineHeight: 1.6 }}>{successMsg}</p>
            <Link to="/login">
              <Button variant="primary" fullWidth>Proceed to Sign In</Button>
            </Link>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              We have sent a verification code to your mailbox. Paste the code below to finalize your registration, or click the verification link inside the email.
            </p>
            <form onSubmit={handleManualSubmit}>
              <Input
                label="Verification Token"
                id="tokenInput"
                placeholder="Paste token from email"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" fullWidth>
                Verify Email
              </Button>
            </form>
            <div style={{ marginTop: '20px' }}>
              <Link to="/login" className="auth-link" style={{ fontSize: '0.9rem' }}>
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="toast-container">
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage;
