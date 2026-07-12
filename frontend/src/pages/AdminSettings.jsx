import React from 'react';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import '../styles/pages.css';

const AdminSettings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <AdminLayout>
      <div className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>⚙ Portal Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure administrative default layout themes and variables.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Display Preferences</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Enable Dark Theme Mode</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toggle default background lighting options across all admin pages.</span>
              </div>
              <input
                type="checkbox"
                id="adminDarkModeToggler"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                style={{
                  width: '44px',
                  height: '22px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary)'
                }}
              />
            </div>
          </Card>

          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>System Variables</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              System credentials and general settings are locked by moderator encryption tokens.
            </p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
