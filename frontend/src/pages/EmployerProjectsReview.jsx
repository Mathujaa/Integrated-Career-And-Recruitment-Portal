import React, { useEffect, useState } from 'react';
import EmployerLayout from '../components/EmployerLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import Input from '../components/Input';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const EmployerProjectsReview = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProj, setSelectedProj] = useState(null);
  
  const [form, setForm] = useState({
    rating: 4,
    comments: '',
    status: 'good'
  });

  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/employer/projects');
      setProjects(response.data.projects);
    } catch (err) {
      console.error(err);
      showToast('Failed to load student projects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleOpenReview = (proj) => {
    setSelectedProj(proj);
    setForm({
      rating: proj.rating || 4,
      comments: proj.comments || '',
      status: proj.review_status || 'good'
    });
    setReviewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/employer/projects/${selectedProj.student_id}/${selectedProj.id}/reviews`, form);
      showToast('Project evaluation submitted successfully!');
      setReviewModalOpen(false);
      fetchProjects();
    } catch (err) {
      showToast('Failed to log project review.', 'error');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'excellent': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
      case 'good': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' };
      case 'needs_improvement': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', color: '#64748B' };
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
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Projects Review Board</h2>
          <p style={{ color: 'var(--text-muted)' }}>Audit candidate portfolios, grade technical structures, and submit feedback logs.</p>
        </div>

        {projects.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
              No student projects submitted in the database yet.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {projects.map((proj, idx) => {
              const badge = getStatusBadgeColor(proj.review_status);
              return (
                <Card key={idx} style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  
                  <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Candidate:</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{proj.first_name} {proj.last_name}</strong>
                    </div>
                    {proj.review_status && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: badge.bg,
                        color: badge.color
                      }}>
                        {proj.review_status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>{proj.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{proj.description}</p>
                  </div>

                  {proj.link && (
                    <div style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
                      🔗 <a href={proj.link} target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                        GitHub Code Repository
                      </a>
                    </div>
                  )}

                  {proj.rating && (
                    <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      ⭐ Employer Rating: <strong>{proj.rating}/5</strong>
                      <p style={{ margin: '4px 0 0 0', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        "{proj.comments || 'No comments left.'}"
                      </p>
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                    <Button variant="outline" onClick={() => handleOpenReview(proj)} style={{ width: '100%' }}>
                      {proj.rating ? 'Edit Project Evaluation' : 'Evaluate & Rate Project'}
                    </Button>
                  </div>

                </Card>
              );
            })}
          </div>
        )}

      </div>

      {/* Review Project Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Audit Student Project Submission">
        {selectedProj && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project Title:</span>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)' }}>{selectedProj.title}</strong>
            </div>

            <div className="input-group">
              <label className="input-label">Employer Rating (1-5 Stars)</label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--secondary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>1 Star (Needs work)</span>
                <strong>Active: {form.rating} Stars</strong>
                <span>5 Stars (Excellent)</span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Project Rating Status</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ appearance: 'auto' }}>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="needs_improvement">Needs Improvement</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Review Comments</label>
              <textarea
                className="input-field"
                rows="4"
                placeholder="Give constructive recommendations, praise layout styling, or specify code logic bugs..."
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                required
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="outline" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Confirm Evaluation</Button>
            </div>
          </form>
        )}
      </Modal>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </EmployerLayout>
  );
};

export default EmployerProjectsReview;
