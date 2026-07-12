import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await apiClient.get('/admin/jobs');
      setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
      showToast('Failed to load job listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleStatusChange = async (jobId, status) => {
    try {
      await apiClient.put(`/admin/jobs/${jobId}/status`, { status });
      showToast(`Job listing status changed to ${status}.`);
      fetchJobs();
    } catch (err) {
      console.error(err);
      showToast('Failed to update job status.', 'error');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing? Applicants will no longer see it.')) {
      return;
    }
    try {
      await apiClient.delete(`/admin/jobs/${jobId}`);
      showToast('Job listing permanently deleted.');
      fetchJobs();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete job listing.', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use admin-specific job update endpoint
      await apiClient.put(`/admin/jobs/${editingJob.id}/details`, editingJob);
      showToast('Job listing details updated successfully.');
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      console.error(err);
      showToast('Failed to update job details.', 'error');
    }
  };

  const filtered = jobs.filter(job => {
    const title = (job.title || '').toLowerCase();
    const company = (job.company_name || '').toLowerCase();
    const location = (job.location || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    
    const matchesSearch = title.includes(query) || company.includes(query) || location.includes(query);
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>💼 Jobs Moderator Board</h2>
          <p style={{ color: 'var(--text-muted)' }}>Approve new placements postings, close active recruitments, edit details, or reject fake listings.</p>
        </div>

        {/* Filter controls */}
        <Card style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <input
            type="text"
            placeholder="Search by role title, company, or location..."
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
              <option value="all">All Jobs</option>
              <option value="active">Active</option>
              <option value="draft">Draft / Pending</option>
              <option value="closed">Closed</option>
              <option value="flagged">Flagged / Fake</option>
            </select>
          </div>
        </Card>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
            <Spinner size="md" />
          </div>
        ) : (
          <Card style={{ padding: '24px' }}>
            {filtered.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 0 }}>No matching job postings found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-light)' }}>
                      <th style={{ padding: '12px' }}>Job Title</th>
                      <th style={{ padding: '12px' }}>Company</th>
                      <th style={{ padding: '12px' }}>Type</th>
                      <th style={{ padding: '12px' }}>Applicants</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(job => (
                      <tr key={job.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{job.title}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{job.company_name || 'N/A'}</td>
                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>{job.employment_type} ({job.work_mode})</td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{job.applicants_count || 0} applied</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            backgroundColor: 
                              job.status === 'active' ? 'rgba(16, 185, 129, 0.1)' :
                              job.status === 'closed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: 
                              job.status === 'active' ? '#10B981' :
                              job.status === 'closed' ? '#EF4444' : '#F59E0B'
                          }}>
                            {job.status === 'active' ? 'active / approved' : job.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Button variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setEditingJob(job)}>Edit</Button>
                          
                          {job.status !== 'active' && (
                            <Button variant="primary" style={{ backgroundColor: '#10B981', borderColor: '#10B981', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(job.id, 'active')}>Approve</Button>
                          )}
                          {job.status === 'active' && (
                            <Button variant="outline" style={{ color: '#F59E0B', borderColor: '#F59E0B', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(job.id, 'closed')}>Close Job</Button>
                          )}
                          {job.status !== 'flagged' && (
                            <Button variant="outline" style={{ color: '#EF4444', borderColor: '#EF4444', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(job.id, 'flagged')}>Reject / Fake</Button>
                          )}
                          
                          <Button variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleDelete(job.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Edit job modal */}
        {editingJob && (
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
              maxWidth: '550px',
              padding: '32px',
              position: 'relative'
            }}>
              <button 
                onClick={() => setEditingJob(null)} 
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

              <h3 style={{ marginBottom: '20px' }}>Edit Job details</h3>
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Job Title</label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Location</label>
                  <input
                    type="text"
                    required
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Employment Type</label>
                    <select
                      value={editingJob.employment_type}
                      onChange={(e) => setEditingJob({ ...editingJob, employment_type: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Work Mode</label>
                    <select
                      value={editingJob.work_mode}
                      onChange={(e) => setEditingJob({ ...editingJob, work_mode: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                    >
                      <option value="on-site">On-site</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Requirements (Comma-separated)</label>
                  <input
                    type="text"
                    value={editingJob.requirements}
                    onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                  <textarea
                    required
                    rows={4}
                    value={editingJob.description}
                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <Button type="button" variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
                  <Button type="submit" variant="primary">Save Changes</Button>
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

export default AdminJobs;
