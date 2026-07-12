import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const menuItems = [
    { name: 'Dashboard',  path: '/admin/dashboard',  icon: '📊' },
    { name: 'Students',   path: '/admin/students',   icon: '🎓' },
    { name: 'Recruiters', path: '/admin/recruiters', icon: '🏢' },
    { name: 'Jobs',       path: '/admin/jobs',       icon: '💼' },
    { name: 'Assessments',path: '/admin/assessments',icon: '📝' },
    { name: 'Interviews', path: '/admin/interviews', icon: '📅' },
    { name: 'Offers',     path: '/admin/offers',     icon: '✉' },
    { name: 'Reports',    path: '/admin/reports',    icon: '📋' },
    { name: 'Audit Log',  path: '/admin/audit-log',  icon: '🗂' },
    { name: 'Settings',   path: '/admin/settings',   icon: '⚙' }
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
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>🛡 Admin Console</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>System administration portal</p>
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
            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            backgroundColor: isActive ? 'rgba(79, 70, 229, 0.06)' : 'transparent',
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

export default AdminSidebar;
