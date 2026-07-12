import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import apiClient from '../services/api.client';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // poll every 60s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/admin/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      // Silently fail — don't break layout
    }
  };

  const markRead = async (id) => {
    try {
      await apiClient.patch(`/admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Panel Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header navigation bar */}
        <header style={{
          height: '70px',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '0 32px',
          gap: '24px'
        }}>

          {/* Notification Bell */}
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
                transition: 'color 0.2s'
              }}
              title="Admin Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  width: '18px', height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotif && (
              <div style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                width: '360px',
                maxHeight: '420px',
                overflowY: 'auto',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg, 12px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                zIndex: 1000,
                animation: 'fadeIn 0.15s ease'
              }}>
                <div style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      backgroundColor: 'rgba(79, 70, 229, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 20).map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.is_read && markRead(notif.id)}
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: notif.is_read ? 'transparent' : 'rgba(79, 70, 229, 0.03)',
                        cursor: notif.is_read ? 'default' : 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontWeight: notif.is_read ? 500 : 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            backgroundColor: 'var(--primary)', flexShrink: 0, marginTop: '5px'
                          }} />
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                        {new Date(notif.created_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                        {notif.category && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '1px 6px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(107,114,128,0.1)',
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            fontWeight: 600
                          }}>
                            {notif.category}
                          </span>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              A
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user?.email || 'Admin'}
              </span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                System Administrator
              </span>
            </div>
          </div>

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
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto', maxWidth: 'var(--max-width)', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

