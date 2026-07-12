import React from 'react';
import EmployerLayout from '../components/EmployerLayout';
import Card from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import '../styles/pages.css';

const EmployerSettings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <EmployerLayout>
      <div className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure portal layouts and update login security choices.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Display Preferences</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Enable Dark Theme Mode</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toggle default background lighting options.</span>
              </div>
              <input
                type="checkbox"
                id="darkModeToggler"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                style={{
                  width: '44px',
                  height: '22px',
                  cursor: 'pointer',
                  accentColor: 'var(--secondary)'
                }}
              />
            </div>
          </Card>

          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Security & Credentials</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Recruiter credentials can be updated from the authentication manager suite.
            </p>
          </Card>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default EmployerSettings;
