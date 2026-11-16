import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import ThemeToggle from './ThemeToggle';
import '../styles/components.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  const getNotificationPath = () => {
    if (user?.role === 'student') return '/student/notifications';
    if (user?.role === 'admin') return '/admin/dashboard';
    return `/${user?.role || 'student'}/dashboard`;
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-light)',
      zIndex: 100,
      padding: '16px 0',
      transition: 'background-color var(--transition-fast), border-color var(--transition-fast)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💼</span> CareerPortal
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Home</Link>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Dashboard</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* 1. Theme Toggle */}
                <ThemeToggle />

                {/* 2. Notification Bell */}
                <Link
                  to={getNotificationPath()}
                  title="Notifications"
                  aria-label="Notifications"
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    color: 'var(--text-muted)',
                    padding: '6px',
                    lineHeight: 1
                  }}
                >
                  🔔
                </Link>

                {/* 3. User Profile */}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Hi, {user.profile?.first_name || user.profile?.company_name || user.profile?.full_name || 'User'}
                </span>

                {/* 4. Sign Out */}
                <Button variant="outline" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ThemeToggle />
              <Link to="/login">
                <Button variant="text" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
