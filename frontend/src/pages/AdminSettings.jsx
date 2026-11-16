import React from 'react';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import '../styles/pages.css';

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>⚙ Portal Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure administrative default layout themes and variables.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Display Preferences</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              The theme toggle has been moved to the top navigation header beside the notification bell for instant system-wide toggling between Light and Dark modes.
            </p>
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
