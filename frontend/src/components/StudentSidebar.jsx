import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import apiClient from '../services/api.client';

const StudentSidebar = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await apiClient.get('/student/notifications');
      const unread = response.data.notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn('Failed to load notifications counts', err.message);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: '📊' },
    { name: 'My Profile', path: '/student/profile', icon: '👤' },
    { name: 'Resume Builder', path: '/student/resumes', icon: '📝' },
    { name: 'AI Resume Scanner', path: '/student/ai-resume-review', icon: '🤖' },
    { name: 'AI Career Mentor', path: '/student/ai-mentor', icon: '🧠' },
    { name: 'Search Jobs', path: '/student/jobs', icon: '🔍' },
    { name: 'Applied Jobs', path: '/student/applications', icon: '💼' },
    { name: 'Saved Jobs', path: '/student/saved-jobs', icon: '⭐' },
    { name: 'Assessments', path: '/student/assessments', icon: '📝' },
    { name: 'My Calendar', path: '/student/calendar', icon: '📅' },
    { name: 'Career Goals', path: '/student/roadmap', icon: '🗺' },
    { name: 'Notifications', path: '/student/notifications', icon: '🔔', badge: true },
    { name: 'Settings', path: '/student/settings', icon: '⚙' }
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
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Candidate Portal</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage career progression</p>
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
          {item.badge && unreadCount > 0 && (
            <span style={{
              backgroundColor: 'var(--error)',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '10px'
            }}>
              {unreadCount}
            </span>
          )}
        </NavLink>
      ))}
    </aside>
  );
};

export default StudentSidebar;
