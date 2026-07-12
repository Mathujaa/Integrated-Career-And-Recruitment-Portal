import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const PAGE_LIMIT = 20;

// Map action prefix to readable label and icon
const ACTION_META = {
  login:                  { label: 'Login',              icon: '🔐', color: '#10B981' },
  register:               { label: 'Registration',       icon: '📝', color: '#3B82F6' },
  admin_approve:          { label: 'Recruiter Approved', icon: '✅', color: '#10B981' },
  admin_reject:           { label: 'Recruiter Rejected', icon: '❌', color: '#EF4444' },
  admin_suspend:          { label: 'Account Suspended',  icon: '⛔', color: '#F59E0B' },
  admin_activate:         { label: 'Account Activated',  icon: '✅', color: '#10B981' },
  admin_delete:           { label: 'Record Deleted',     icon: '🗑️', color: '#EF4444' },
  admin_job_status:       { label: 'Job Status Changed', icon: '💼', color: '#6366F1' },
  admin_reschedule:       { label: 'Interview Rescheduled', icon: '📅', color: '#F59E0B' },
  admin_cancel:           { label: 'Interview Cancelled', icon: '🚫', color: '#EF4444' },
  verify_email:           { label: 'Email Verified',     icon: '📧', color: '#10B981' },
  complete_profile:       { label: 'Profile Completed',  icon: '👤', color: '#3B82F6' }
};

const getActionMeta = (action) => {
  for (const [key, meta] of Object.entries(ACTION_META)) {
    if (action?.startsWith(key)) return meta;
  }
  return { label: action || 'Unknown', icon: '📋', color: 'var(--text-muted)' };
};

const AdminAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchLogs(); }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_LIMIT, search: searchTerm });
      const res = await apiClient.get(`/admin/audit-logs?${params}`);
      setLogs(res.data.rows || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load audit logs.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <AdminLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🗂 Audit Log</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Complete chronological record of all administrative and user actions performed on the portal.
          </p>
        </div>

        {/* Summary bar */}
        <Card style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(79, 70, 229, 0.04)', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total records: <strong style={{ color: 'var(--primary)' }}>{total.toLocaleString()}</strong>
          </span>
          <span style={{ color: 'var(--border-light)' }}>|</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing page {page} of {totalPages || 1}
          </span>
        </Card>

        {/* Search */}
        <Card style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by action or user email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-main)', color: 'var(--text-main)',
                flex: 1, minWidth: '240px'
              }}
            />
            <Button type="submit" variant="outline" style={{ padding: '10px 18px' }}>Search</Button>
          </form>
        </Card>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}><Spinner size="md" /></div>
        ) : (
          <>
            <Card style={{ padding: '24px' }}>
              {logs.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '24px 0' }}>No audit log entries found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-light)' }}>
                        <th style={{ padding: '10px 12px' }}>Timestamp</th>
                        <th style={{ padding: '10px 12px' }}>User</th>
                        <th style={{ padding: '10px 12px' }}>Role</th>
                        <th style={{ padding: '10px 12px' }}>Action</th>
                        <th style={{ padding: '10px 12px' }}>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => {
                        const meta = getActionMeta(log.action);
                        return (
                          <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                              {new Date(log.created_at).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                              })}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ fontWeight: 600, display: 'block' }}>{log.email || 'System'}</span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              {log.role && (
                                <span style={{
                                  padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  backgroundColor: log.role === 'admin' ? 'rgba(79,70,229,0.1)' : 'rgba(107,114,128,0.1)',
                                  color: log.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)'
                                }}>
                                  {log.role}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
                                <div>
                                  <span style={{ fontWeight: 600, color: meta.color, display: 'block' }}>{meta.label}</span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    {log.action}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                              {log.ip_address}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                <Button variant="outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  ← Prev
                </Button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Page {page} of {totalPages} · {total.toLocaleString()} total entries
                </span>
                <Button variant="outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next →
                </Button>
              </div>
            )}
          </>
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

export default AdminAuditLog;
