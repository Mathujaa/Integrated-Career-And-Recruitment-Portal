import React from 'react';
import EmployerLayout from '../components/EmployerLayout';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import '../styles/pages.css';

const EmployerSettings = () => {
  const { user } = useAuth();

  return (
    <EmployerLayout>
      <div className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Recruiter Account Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage recruitment preferences, portal configurations, and security choices.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Recruiter Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Company Name</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{user?.profile?.company_name || 'Enterprise Recruiter'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</span>
                <span style={{ color: 'var(--text-main)' }}>{user?.email || 'recruiter@portal.com'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Approval Status</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                  ✔ Approved Corporate Recruiter
                </span>
              </div>
            </div>
          </Card>

          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Security & Credentials</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Recruiter credentials and two-factor authentication can be updated from the central identity manager suite.
            </p>
          </Card>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default EmployerSettings;
