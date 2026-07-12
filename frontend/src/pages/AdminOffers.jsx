import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchOffers(); }, [statusFilter]);

  const fetchOffers = async () => {
    try {
      const params = new URLSearchParams({ search: searchTerm, status: statusFilter });
      const res = await apiClient.get(`/admin/offers?${params}`);
      setOffers(res.data.offers);
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error(err);
      showToast('Failed to load placement offers ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchOffers();
  };

  const formatSalary = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '—';
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return '—'; }
  };

  const statusStyle = (s) => ({
    padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
    backgroundColor: s === 'accepted' ? 'rgba(16,185,129,0.1)' : s === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
    color: s === 'accepted' ? '#10B981' : s === 'pending' ? '#F59E0B' : '#EF4444'
  });

  return (
    <AdminLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>✉ Placement Offers Ledger</h2>
          <p style={{ color: 'var(--text-muted)' }}>Audit issued salary packages, check joining dates, and track offer acceptance statuses.</p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total Offers', value: summary.total || 0, color: 'var(--primary)' },
            { label: 'Accepted',     value: summary.accepted || 0, color: '#10B981' },
            { label: 'Pending',      value: summary.pending || 0, color: '#F59E0B' },
            { label: 'Declined',     value: summary.declined || 0, color: '#EF4444' }
          ].map((s, i) => (
            <Card key={i} style={{ padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</span>
              <strong style={{ fontSize: '1.5rem', display: 'block', marginTop: '4px', color: s.color }}>{s.value}</strong>
            </Card>
          ))}
        </div>

        {/* Search & Filter */}
        <Card style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by student name or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-main)', color: 'var(--text-main)',
                flex: 1, minWidth: '220px'
              }}
            />
            <Button type="submit" variant="outline" style={{ padding: '10px 18px' }}>Search</Button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
            style={{
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 600
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </Card>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}><Spinner size="md" /></div>
        ) : (
          <Card style={{ padding: '24px' }}>
            {offers.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '24px 0' }}>
                No placement offers found for the selected filter.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-light)' }}>
                      <th style={{ padding: '12px' }}>Candidate Name</th>
                      <th style={{ padding: '12px' }}>Position / Role</th>
                      <th style={{ padding: '12px' }}>Company</th>
                      <th style={{ padding: '12px' }}>Salary Package</th>
                      <th style={{ padding: '12px' }}>Joining Date</th>
                      <th style={{ padding: '12px' }}>Expiration Date</th>
                      <th style={{ padding: '12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map(off => (
                      <tr key={off.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{off.first_name} {off.last_name}</td>
                        <td style={{ padding: '12px', color: 'var(--text-main)' }}>{off.role}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{off.company_name}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--primary)' }}>{formatSalary(off.salary)}</td>
                        <td style={{ padding: '12px', color: 'var(--text-light)' }}>{formatDate(off.joining_date)}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDate(off.expiry_date)}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={statusStyle(off.status)}>{off.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
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

export default AdminOffers;
