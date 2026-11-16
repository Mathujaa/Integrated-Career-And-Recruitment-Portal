import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmployerSidebar from './EmployerSidebar';
import ThemeToggle from './ThemeToggle';

const EmployerLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="recruiter-suite-root" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Sidebar Navigation */}
      <EmployerSidebar />

      {/* Main Panel Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header navigation bar: Moon/Sun Toggle -> Notification Bell -> Profile Avatar -> Email/Role -> Sign Out */}
        <header style={{
          height: '70px',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '0 32px',
          gap: '20px'
        }}>
          {/* 1. Dark / Light Mode Toggle */}
          <ThemeToggle />

          {/* 2. Notification Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotif(prev => !prev)}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.3rem',
                padding: '6px',
                color: 'var(--text-muted)',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Notifications"
              aria-label="Notifications"
            >
              🔔
            </button>

            {showNotif && (
              <div style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg, 12px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                zIndex: 1000,
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', textAlign: 'left', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  Notifications
                </div>
                <div style={{ padding: '24px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No new notifications
                </div>
              </div>
            )}
          </div>

          {/* 3. User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              R
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user?.email || 'Recruiter'}
              </span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Company Representative
              </span>
            </div>
          </div>

          {/* 4. Sign Out */}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            Sign Out
          </button>
        </header>

        {/* Content body wrapper */}
        <main className="recruiter-main-content" style={{ flex: 1, maxWidth: 'var(--max-width)', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default EmployerLayout;
