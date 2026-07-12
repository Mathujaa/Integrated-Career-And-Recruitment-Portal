import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const AdminRecruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      const res = await apiClient.get('/admin/recruiters');
      setRecruiters(res.data.rows || res.data.recruiters || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load recruiters list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleStatusChange = async (recruiterId, status) => {
    try {
      await apiClient.put(`/admin/recruiters/${recruiterId}/status`, { status });
      showToast(`Recruiter account successfully updated to ${status}.`);
      fetchRecruiters();
      if (selectedRecruiter && selectedRecruiter.profile.id === recruiterId) {
        handleViewDetails(recruiterId);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update recruiter status.', 'error');
    }
  };

  const handleDelete = async (recruiterId) => {
    if (!window.confirm('Are you sure you want to permanently delete this recruiter account? All associated jobs and listings will also be deleted.')) {
      return;
    }
    try {
      await apiClient.delete(`/admin/recruiters/${recruiterId}`);
      showToast('Recruiter account permanently deleted.');
      setSelectedRecruiter(null);
      fetchRecruiters();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete recruiter account.', 'error');
    }
  };

  const handleViewDetails = async (recruiterId) => {
    setDetailsLoading(true);
    try {
      const res = await apiClient.get(`/admin/recruiters/${recruiterId}`);
      setSelectedRecruiter(res.data.recruiter);
    } catch (err) {
      console.error(err);
      showToast('Failed to load recruiter company details.', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const filtered = recruiters.filter(rec => {
    const companyName = (rec.company_name || '').toLowerCase();
    const industry = (rec.company_industry || '').toLowerCase();
    const email = (rec.email || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    
    const matchesSearch = companyName.includes(query) || industry.includes(query) || email.includes(query);
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🏢 Recruiters Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Moderate corporate recruiter registrations, approve company profiles, and inspect posted positions.</p>
        </div>

        {/* Filter controls */}
        <Card style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <input
            type="text"
            placeholder="Search by company name, industry, or representative..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-main)',
              color: 'var(--text-main)',
              flex: 1,
              maxWidth: '400px'
            }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontWeight: 600
              }}
            >
              <option value="all">All Registrations</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </Card>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
            <Spinner size="md" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <Card style={{ padding: '24px' }}>
              {filtered.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 0 }}>No matching recruiter registrations found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-light)' }}>
                        <th style={{ padding: '12px' }}>Company</th>
                        <th style={{ padding: '12px' }}>Representative Email</th>
                        <th style={{ padding: '12px' }}>Industry</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(rec => (
                        <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{rec.company_name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{rec.email}</td>
                          <td style={{ padding: '12px', color: 'var(--text-light)' }}>{rec.company_industry || 'N/A'}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              backgroundColor: 
                                rec.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' :
                                rec.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: 
                                rec.status === 'approved' ? '#10B981' :
                                rec.status === 'pending' ? '#F59E0B' : '#EF4444'
                            }}>
                              {rec.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <Button variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleViewDetails(rec.id)}>Company Details</Button>
                            {rec.status === 'pending' && (
                              <>
                                <Button variant="primary" style={{ backgroundColor: '#10B981', borderColor: '#10B981', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(rec.id, 'approved')}>Approve</Button>
                                <Button variant="outline" style={{ color: '#EF4444', borderColor: '#EF4444', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(rec.id, 'rejected')}>Reject</Button>
                              </>
                            )}
                            {rec.status === 'approved' && (
                              <Button variant="outline" style={{ color: '#F59E0B', borderColor: '#F59E0B', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(rec.id, 'suspended')}>Suspend</Button>
                            )}
                            {rec.status === 'suspended' && (
                              <Button variant="outline" style={{ color: '#10B981', borderColor: '#10B981', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(rec.id, 'approved')}>Re-Approve</Button>
                            )}
                            <Button variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleDelete(rec.id)}>Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* View recruiter details modal */}
        {selectedRecruiter && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }}>
            <Card style={{
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative'
            }}>
              <button 
                onClick={() => setSelectedRecruiter(null)} 
                style={{
                  position: 'absolute',
                  right: '24px',
                  top: '24px',
                  border: 'none',
                  background: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-light)'
                }}
              >
                ✕
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'
                }}>
                  {selectedRecruiter.profile.company_name[0]}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedRecruiter.profile.company_name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {selectedRecruiter.profile.email} | Registration: <strong style={{ textTransform: 'uppercase' }}>{selectedRecruiter.profile.status}</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '24px' }}>
                
                {/* Company details */}
                <div>
                  <h4 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '12px' }}>Company profile</h4>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Website:</strong> <a href={selectedRecruiter.profile.company_website} target="_blank" rel="noreferrer">{selectedRecruiter.profile.company_website || 'N/A'}</a></p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Industry:</strong> {selectedRecruiter.profile.company_industry || 'N/A'}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Company Size:</strong> {selectedRecruiter.profile.company_size || 'N/A'}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Phone contact:</strong> {selectedRecruiter.profile.contact_phone || 'N/A'}</p>
                  
                  <h5 style={{ margin: '16px 0 8px 0' }}>About company</h5>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {selectedRecruiter.profile.company_description || 'No company bio provided.'}
                  </p>
                </div>

                {/* Posted jobs list */}
                <div>
                  <h4 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '12px' }}>Posted Jobs ({selectedRecruiter.jobs.length})</h4>
                  {selectedRecruiter.jobs.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No jobs posted by this representative.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                      {selectedRecruiter.jobs.map((job, idx) => (
                        <div key={idx} style={{ padding: '10px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>{job.title}</span>
                            <span style={{
                              color: job.status === 'active' ? '#10B981' : 'var(--text-light)',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase'
                            }}>{job.status}</span>
                          </div>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{job.location} | {job.employment_type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
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

export default AdminRecruiters;
