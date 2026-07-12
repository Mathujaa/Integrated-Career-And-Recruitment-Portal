import React from 'react';
import { NavLink } from 'react-router-dom';

const EmployerSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/employer/dashboard', icon: '📊' },
    { name: 'Jobs Posted', path: '/employer/jobs', icon: '💼' },
    { name: 'Projects Review', path: '/employer/projects', icon: '💻' },
    { name: 'Assessments', path: '/employer/assessments', icon: '📝' },
    { name: 'Offers Board', path: '/employer/offers', icon: '✉' },
    { name: 'Settings', path: '/employer/settings', icon: '⚙' }
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border-light)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      flexShrink: 0,
      maxHeight: '100vh',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '0 8px 16px 8px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Recruiter Suite</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Manage hiring & placements</p>
      </div>
      {menuItems.map((item, idx) => (
        <NavLink
          key={idx}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            color: isActive ? 'var(--secondary)' : 'var(--text-muted)',
            backgroundColor: isActive ? 'rgba(124, 58, 237, 0.06)' : 'transparent',
            fontWeight: isActive ? 600 : 500,
            transition: 'all var(--transition-fast)'
          })}
        >
          <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
          <span style={{ flex: 1 }}>{item.name}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default EmployerSidebar;
