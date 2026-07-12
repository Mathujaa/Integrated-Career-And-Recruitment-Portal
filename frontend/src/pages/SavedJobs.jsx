import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await apiClient.get('/jobs/saved');
      setSavedJobs(response.data.savedJobs);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load bookmarked jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await apiClient.delete(`/jobs/details/${jobId}/unsave`);
      showToast('Job bookmark removed.');
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      showToast('Failed to remove bookmark.', 'error');
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

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
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Saved Job Listings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Keep track of job openings you have bookmarked for future reference.</p>
        </div>

        {errorMsg && (
          <div className="card input-error-border" style={{ color: 'var(--error)', marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        {savedJobs.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <p>You have no saved job listings yet.</p>
            <Link to="/student/jobs" style={{ marginTop: '16px', display: 'inline-block' }}>
              <span className="auth-link">Search active job listings now →</span>
            </Link>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {savedJobs.map((job, idx) => (
              <Card key={idx} style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                      <Link to={`/student/jobs/${job.id}`} style={{ color: 'var(--text-main)' }}>
                        {job.title}
                      </Link>
                    </h3>

                    {/* Matching rate badge */}
                    {job.aiMatch?.matchPercent > 0 && (
                      <span style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        color: 'var(--success)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '12px'
                      }}>
                        🎯 {job.aiMatch.matchPercent}% Match
                      </span>
                    )}

                    <span style={{
                      backgroundColor: 'rgba(79, 70, 229, 0.08)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase'
                    }}>
                      {job.work_mode}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '12px' }}>
                    Company Recruiting • {job.location} • <span style={{ textTransform: 'capitalize' }}>{job.employment_type.replace('-', ' ')}</span>
                  </p>
                  
                  {job.salary_min && (
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>
                      ₹{parseFloat(job.salary_min).toLocaleString()} - ₹{parseFloat(job.salary_max).toLocaleString()} / year
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Button variant="outline" onClick={() => handleUnsave(job.id)} style={{ color: 'var(--error)' }}>
                    Unsave
                  </Button>
                  <Link to={`/student/jobs/${job.id}`}>
                    <Button variant="primary">
                      View Details
                    </Button>
                  </Link>
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

export default SavedJobs;
