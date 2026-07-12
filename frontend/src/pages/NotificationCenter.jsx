import React, { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'jobs', 'interviews', 'assessments', 'system'

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/student/notifications');
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleMarkRead = async (id) => {
    try {
      await apiClient.put(`/student/notifications/${id}/read`);
      showToast('Notification marked as read.');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to mark read.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put('/student/notifications/read-all');
      showToast('All notifications marked as read.');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to mark all read.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/student/notifications/${id}`);
      showToast('Notification deleted.');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to delete notification.', 'error');
    }
  };

  const getFilteredNotifications = () => {
    if (activeCategory === 'all') return notifications;
    return notifications.filter(n => n.category === activeCategory);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'jobs': return '💼';
      case 'interviews': return '📅';
      case 'assessments': return '📝';
      case 'system':
      default:
        return '⚙';
    }
  };

  const filteredList = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <StudentLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Spinner size="lg" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Notification Center</h2>
            <p style={{ color: 'var(--text-muted)' }}>Keep track of job alerts, interview schedules, and skill badges.</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          )}
        </div>

        {/* Categories Tab selector */}
        <div className="signup-role-selector" style={{ maxWidth: '600px', marginBottom: '32px' }}>
          {['all', 'jobs', 'interviews', 'assessments', 'system'].map((cat, i) => (
            <button
              key={i}
              type="button"
              className={`role-tab-btn ${activeCategory === cat ? 'role-tab-btn-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={{ textTransform: 'capitalize', fontSize: '0.85rem', padding: '10px' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredList.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <p>No notifications found in this category.</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredList.map((notify, idx) => (
              <Card key={idx} style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                borderLeft: notify.is_read ? '1px solid var(--border-light)' : '4px solid var(--primary)',
                backgroundColor: notify.is_read ? 'var(--bg-card)' : 'rgba(79, 70, 229, 0.01)'
              }}>
                <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>
                  {getCategoryIcon(notify.category)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{notify.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(notify.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {notify.message}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!notify.is_read && (
                      <Button variant="text" onClick={() => handleMarkRead(notify.id)} style={{ padding: 0, fontSize: '0.8rem', fontWeight: 600 }}>
                        Mark Read
                      </Button>
                    )}
                    <Button variant="text" onClick={() => handleDelete(notify.id)} style={{ padding: 0, fontSize: '0.8rem', color: 'var(--error)' }}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </StudentLayout>
  );
};

export default NotificationCenter;
