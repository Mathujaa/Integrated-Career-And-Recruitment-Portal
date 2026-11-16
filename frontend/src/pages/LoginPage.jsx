import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import '../styles/pages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastType, setToastType] = useState('error');
  const [loadingState, setLoadingState] = useState(false);
  
  // Google OAuth state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const sanitizedEmail = email.trim();
    if (!sanitizedEmail || !password) {
      setToastType('error');
      setErrorMsg('Please input your email and password.');
      return;
    }

    setLoadingState(true);
    setErrorMsg('');

    try {
      const loggedUser = await login(sanitizedEmail, password);
      // Route to user's dashboard based on backend role subclass
      navigate(`/${loggedUser.role}/dashboard`, { replace: true });
    } catch (err) {
      setToastType('error');
      const raw = typeof err === 'string' ? err : err?.message || 'Login failed. Please check credentials.';
      if (raw.toLowerCase().includes('incorrect email or password')) {
        setErrorMsg('Incorrect email or password. Student password is Mathujaa@03 (or click the Student button below)');
      } else {
        setErrorMsg(raw);
      }
    } finally {
      setLoadingState(false);
    }
  };

  const handleGoogleAccountSelect = async (account) => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const loggedUser = await googleLogin({
        email: account.email,
        name: account.name,
        given_name: account.given_name || account.name.split(' ')[0],
        family_name: account.family_name || account.name.split(' ').slice(1).join(' '),
        picture: account.picture || null,
        sub: account.sub || `google_sub_${Date.now()}`
      });
      setGoogleModalOpen(false);
      navigate(`/${loggedUser.role}/dashboard`, { replace: true });
    } catch (err) {
      setToastType('error');
      setErrorMsg(typeof err === 'string' ? err : err?.message || 'Google sign-in failed.');
      setGoogleModalOpen(false);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleCancel = () => {
    setGoogleModalOpen(false);
    setShowCustomGoogleInput(false);
    setToastType('info');
    setErrorMsg('Google sign-in was cancelled.');
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px' }}>
            <Link to="/" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', display: 'inline-block' }}>
              💼 CareerPortal
            </Link>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to check your personalized dashboard</p>
        </div>

        {/* Continue with Google button */}
        <button
          type="button"
          className="social-login-btn"
          disabled={googleLoading || loadingState}
          onClick={() => {
            setErrorMsg('');
            setGoogleModalOpen(true);
          }}
          style={{ opacity: googleLoading ? 0.7 : 1, cursor: googleLoading ? 'wait' : 'pointer' }}
        >
          {googleLoading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="spinner-sm" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #ccc', borderTopColor: '#4285F4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Connecting to Google...
            </span>
          ) : (
            <>
              <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="divider-container">or sign in with email</div>

        <form onSubmit={handleLoginSubmit}>
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div style={{ position: 'relative' }}>
            <Input
              label="Password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: showPassword ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              }
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-12px', marginBottom: '20px' }}>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.85rem' }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loadingState}>
            Sign In
          </Button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light, #e2e8f0)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'center', fontWeight: 600 }}>
            Demo Quick-Fill:
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('mathujaapm@gmail.com');
                setPassword('Mathujaa@03');
                setErrorMsg('');
              }}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: 'rgba(79, 70, 229, 0.08)',
                color: 'var(--primary)',
                border: '1px solid rgba(79, 70, 229, 0.25)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('majaa@infosys.com');
                setPassword('Employer@123');
                setErrorMsg('');
              }}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.08)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              💼 Recruiter
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@careerportal.com');
                setPassword('Admin@123');
                setErrorMsg('');
              }}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Create an account
          </Link>
        </div>
      </div>

      {/* Google Account Selection Modal */}
      {googleModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '440px',
            border: '1px solid var(--border-light)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 24px 16px', textAlign: 'center', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <svg style={{ width: '32px', height: '32px' }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Sign in with Google
              </h3>
              <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Choose an account to continue to CareerPortal
              </p>
            </div>

            {/* Account List */}
            <div style={{ padding: '8px 16px' }}>
              {/* Account 1: Mathujaa PM (Student) */}
              <button
                type="button"
                onClick={() => handleGoogleAccountSelect({
                  email: 'mathujaapm@gmail.com',
                  name: 'Mathujaa PM',
                  picture: 'http://localhost:5000/uploads/avatars/avatar_2_1794838135770.png',
                  sub: 'google_1029384756'
                })}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#4f46e5',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  marginRight: '12px',
                  flexShrink: 0
                }}>
                  M
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    Mathujaa PM
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    mathujaapm@gmail.com
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  Student
                </span>
              </button>

              {/* Account 2: Majaa Employer (Recruiter) */}
              <button
                type="button"
                onClick={() => handleGoogleAccountSelect({
                  email: 'majaa@infosys.com',
                  name: 'Majaa Employer',
                  picture: null,
                  sub: 'google_9988776655'
                })}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#10b981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  marginRight: '12px',
                  flexShrink: 0
                }}>
                  I
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    Majaa Employer
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    majaa@infosys.com
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  Recruiter
                </span>
              </button>

              {/* Account 3: Alex Morgan (New Student) */}
              <button
                type="button"
                onClick={() => handleGoogleAccountSelect({
                  email: 'alex.morgan@gmail.com',
                  name: 'Alex Morgan',
                  picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
                  sub: 'google_5544332211'
                })}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  marginRight: '12px',
                  flexShrink: 0
                }}>
                  A
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    Alex Morgan
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    alex.morgan@gmail.com
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  New Student
                </span>
              </button>

              {/* Use Another Account Toggle */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--primary, #4f46e5)',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', marginRight: '14px', lineHeight: 1 }}>➕</span>
                  Use another Google account
                </button>
              ) : (
                <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', margin: '8px 0', border: '1px solid var(--border-light)' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Enter any Google Email address:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      style={{
                        flexGrow: 1,
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      type="button"
                      disabled={!customGoogleEmail.includes('@')}
                      onClick={() => {
                        const email = customGoogleEmail.trim().toLowerCase();
                        const namePart = email.split('@')[0];
                        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                        handleGoogleAccountSelect({
                          email,
                          name: formattedName,
                          picture: null,
                          sub: `google_custom_${Date.now()}`
                        });
                      }}
                      style={{
                        padding: '8px 14px',
                        background: '#4f46e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: customGoogleEmail.includes('@') ? 'pointer' : 'not-allowed',
                        opacity: customGoogleEmail.includes('@') ? 1 : 0.6
                      }}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Cancel Action */}
            <div style={{ padding: '12px 24px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={handleGoogleCancel}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="toast-container">
          <Toast message={errorMsg} type={toastType} onClose={() => setErrorMsg('')} />
        </div>
      )}
    </div>
  );
};

export default LoginPage;