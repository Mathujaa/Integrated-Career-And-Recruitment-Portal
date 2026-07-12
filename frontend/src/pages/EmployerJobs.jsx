import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployerLayout from '../components/EmployerLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const EmployerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);

  // Form Fields
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary_min: '',
    salary_max: '',
    employment_type: 'full-time',
    work_mode: 'remote'
  });

  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await apiClient.get('/employer/jobs');
      setJobs(response.data.jobs);
    } catch (err) {
      console.error(err);
      showToast('Failed to load jobs list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleOpenCreate = () => {
    setForm({
      title: '',
      description: '',
      requirements: '',
      location: '',
      salary_min: '',
      salary_max: '',
      employment_type: 'full-time',
      work_mode: 'remote'
    });
    setEditMode(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      salary_min: job.salary_min || '',
      salary_max: job.salary_max || '',
      employment_type: job.employment_type || 'full-time',
      work_mode: job.work_mode || 'remote'
    });
    setCurrentJobId(job.id);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await apiClient.put(`/employer/jobs/${currentJobId}`, form);
        showToast('Job posting details updated successfully.');
      } else {
        await apiClient.post('/employer/jobs', form);
        showToast('New job posting created successfully.');
      }
      setModalOpen(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      showToast('Failed to save job posting.', 'error');
    }
  };

  const handleCloseJob = async (id) => {
    if (!confirm('Are you sure you want to close this job listing? Applicants will no longer be accepted.')) return;
    try {
      await apiClient.put(`/employer/jobs/${id}/close`);
      showToast('Job listing marked as closed.');
      fetchJobs();
    } catch (err) {
      showToast('Failed to close job listing.', 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this job listing?')) return;
    try {
      await apiClient.delete(`/employer/jobs/${id}`);
      showToast('Job listing deleted successfully.');
      fetchJobs();
    } catch (err) {
      showToast('Failed to delete job listing.', 'error');
    }
  };

  if (loading) {
    return (
      <EmployerLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Spinner size="lg" />
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="fade-in">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Jobs Postings Board</h2>
            <p style={{ color: 'var(--text-muted)' }}>Publish new placement roles, edit details, or review candidate applications.</p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate}>+ Post New Job</Button>
        </div>

        {jobs.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '24px' }}>
              No job postings created yet. Click the button to publish your first role.
            </p>
            <Button variant="primary" onClick={handleOpenCreate}>Post Your First Job</Button>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {jobs.map((job, idx) => (
              <Card key={idx} style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', borderTop: job.status === 'open' ? '4px solid #10B981' : '4px solid #94A3B8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{job.title}</h4>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: job.status === 'open' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                    color: job.status === 'open' ? '#10B981' : '#64748B'
                  }}>
                    {job.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                  <span>📍 {job.location} | {job.work_mode}</span>
                  <span>💼 {job.employment_type}</span>
                  {job.salary_min && <span>💰 INR {job.salary_min.toLocaleString()} - {job.salary_max ? job.salary_max.toLocaleString() : 'Negotiable'}</span>}
                </div>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '24px'
                }}>
                  {job.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
                  <Button variant="primary" onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>
                    View Applicants
                  </Button>
                  <Button variant="outline" onClick={() => handleOpenEdit(job)} style={{ padding: '8px 12px' }}>
                    ✏
                  </Button>
                  {job.status === 'open' && (
                    <Button variant="outline" onClick={() => handleCloseJob(job.id)} style={{ color: '#F59E0B', padding: '8px 12px' }}>
                      ⏸
                    </Button>
                  )}
                  <Button variant="text" onClick={() => handleDeleteJob(job.id)} style={{ color: 'var(--error)', padding: '8px' }}>
                    🗑
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>

      {/* Create / Edit Job Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit Job Posting' : 'Post New Job Opportunity'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Position Title" id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Lead React Developer" />
          <div className="input-group">
            <label className="input-label">Job Description</label>
            <textarea
              id="description"
              className="input-field"
              rows="4"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              placeholder="Describe roles, responsibilities, and team profile..."
              style={{ resize: 'none' }}
            ></textarea>
          </div>
          <Input label="Requirements / Tech Stack" id="requirements" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="e.g. React, NodeJS, SQL, CSS variables" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Location" id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore, Remote" />
            <div className="input-group">
              <label className="input-label">Work Mode</label>
              <select className="input-field" value={form.work_mode} onChange={(e) => setForm({ ...form, work_mode: e.target.value })} style={{ appearance: 'auto' }}>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-Site</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Salary Min (INR)" type="number" id="salMin" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
            <Input label="Salary Max (INR)" type="number" id="salMax" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
          </div>

          <div className="input-group">
            <label className="input-label">Employment Type</label>
            <select className="input-field" value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} style={{ appearance: 'auto' }}>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm & Publish</Button>
          </div>
        </form>
      </Modal>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </EmployerLayout>
  );
};

export default EmployerJobs;
