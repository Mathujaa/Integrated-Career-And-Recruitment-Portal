import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const STATUS_COLORS = {
  scheduled: { bg: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' },
  completed:  { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
  cancelled:  { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
  no_show:    { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }
};

const AdminInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [rescheduling, setRescheduling] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchInterviews(); }, [statusFilter]);

  const fetchInterviews = async () => {
    try {
      const params = new URLSearchParams({ status: statusFilter, search: searchTerm });
      const res = await apiClient.get(`/admin/interviews?${params}`);
      setInterviews(res.data.interviews);
    } catch (err) {
      console.error(err);
      showToast('Failed to load interviews list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchInterviews();
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) return;
    try {
      await apiClient.put(`/admin/interviews/${rescheduling.id}/reschedule`, { date: newDate, time: newTime });
      showToast('Interview slot successfully rescheduled. Student notified.');
      setRescheduling(null);
      fetchInterviews();
    } catch (err) {
      console.error(err);
      showToast('Failed to reschedule interview.', 'error');
    }
  };

  const handleCancel = async (interview) => {
    if (!window.confirm(`Cancel interview for ${interview.first_name} ${interview.last_name}? They will be notified.`)) return;
    try {
      await apiClient.patch(`/admin/interviews/${interview.id}/cancel`);
      showToast('Interview cancelled. Student has been notified.');
      fetchInterviews();
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel interview.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>📅 Technical & HR Interviews Board</h2>
          <p style={{ color: 'var(--text-muted)' }}>Audit scheduled recruiter meetings, resolve conflicts, and reschedule or cancel slots.</p>
        </div>

        {/* Filter Controls */}
        <Card style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by candidate or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                flex: 1,
                minWidth: '200px'
              }}
            />
            <Button type="submit" variant="outline" style={{ padding: '10px 18px' }}>Search</Button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-main)',
              color: 'var(--text-main)',
              fontWeight: 600
            }}
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </Card>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
            <Spinner size="md" />
          </div>
        ) : (
          <Card style={{ padding: '24px' }}>
            {interviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '24px 0' }}>
                No interviews found for the selected filter.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-light)' }}>
                      <th style={{ padding: '12px' }}>Candidate</th>
                      <th style={{ padding: '12px' }}>Job Position</th>
                      <th style={{ padding: '12px' }}>Company</th>
                      <th style={{ padding: '12px' }}>Scheduled Date / Time</th>
                      <th style={{ padding: '12px' }}>Mode</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map(meet => {
                      const dateObj = new Date(meet.interview_date);
                      const sc = STATUS_COLORS[meet.status] || STATUS_COLORS.scheduled;
                      return (
                        <tr key={meet.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{meet.first_name} {meet.last_name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-main)' }}>{meet.job_title}</td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{meet.company_name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-light)', fontWeight: 600 }}>
                            {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                            {meet.mode}
                            {meet.location_link && (
                              <a href={meet.location_link} target="_blank" rel="noreferrer"
                                 style={{ marginLeft: '8px', color: 'var(--primary)', fontSize: '0.8rem' }}>
                                🔗 Join
                              </a>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 8px', borderRadius: '12px',
                              fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                              backgroundColor: sc.bg, color: sc.color
                            }}>
                              {meet.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {meet.status === 'scheduled' && (
                              <>
                                <Button
                                  variant="outline"
                                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                  onClick={() => {
                                    setRescheduling(meet);
                                    setNewDate(meet.interview_date.substring(0, 10));
                                    setNewTime(meet.interview_date.substring(11, 16));
                                  }}
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  variant="outline"
                                  style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#EF4444', borderColor: '#EF4444' }}
                                  onClick={() => handleCancel(meet)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Reschedule Modal */}
        {rescheduling && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px'
          }}>
            <Card style={{ width: '100%', maxWidth: '450px', padding: '32px', position: 'relative' }}>
              <button
                onClick={() => setRescheduling(null)}
                style={{ position: 'absolute', right: '24px', top: '24px', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)' }}
              >✕</button>
              <h3 style={{ marginBottom: '20px' }}>Reschedule Meeting</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Select a new slot for <strong>{rescheduling.first_name}'s</strong> interview for <strong>{rescheduling.job_title}</strong>.
              </p>
              <form onSubmit={handleRescheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>New Date</label>
                  <input type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>New Time</label>
                  <input type="time" required value={newTime} onChange={(e) => setNewTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <Button type="button" variant="outline" onClick={() => setRescheduling(null)}>Cancel</Button>
                  <Button type="submit" variant="primary">Confirm Reschedule</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {toast && (
          <div className="toast-container">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInterviews;
