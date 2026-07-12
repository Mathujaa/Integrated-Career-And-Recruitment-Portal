import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
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

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-light)',
      zIndex: 100,
      padding: '16px 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💼</span> CareerPortal
        </Link>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Home</Link>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Dashboard</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Hi, {user.profile?.first_name || user.profile?.company_name || user.profile?.full_name || 'User'}
                </span>
                <Button variant="outline" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="text" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
