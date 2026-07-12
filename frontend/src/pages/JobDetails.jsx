import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/jobs/details/${id}`);
      setJob(response.data.job);
      
      const resResponse = await apiClient.get('/jobs/resumes');
      const resumeList = resResponse.data.resumes;
      setResumes(resumeList);
      if (resumeList.length > 0) {
        setSelectedResumeId(resumeList[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve job details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleToggleSave = async () => {
    try {
      if (job.isSaved) {
        await apiClient.delete(`/jobs/details/${id}/unsave`);
        showToast('Job bookmark removed.');
      } else {
        await apiClient.post(`/jobs/details/${id}/save`);
        showToast('Job bookmarked successfully.');
      }
      setJob(prev => ({ ...prev, isSaved: !prev.isSaved }));
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const handleShare = () => {
    const jobUrl = window.location.href;
    navigator.clipboard.writeText(jobUrl);
    showToast('Job page link copied to clipboard! 🔗', 'success');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (resumes.length === 0) {
      showToast('Please create a resume profile before applying.', 'warning');
      return;
    }

    try {
      await apiClient.post(`/jobs/details/${id}/apply`, {
        resumeId: selectedResumeId,
        coverLetter
      });
      showToast('Your application has been submitted successfully!', 'success');
      setApplyModalOpen(false);
      setJob(prev => ({ ...prev, isApplied: true }));
    } catch (err) {
      showToast(err || 'Failed to submit application.', 'error');
    }
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

  if (!job) {
    return (
      <StudentLayout>
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <p>Job details not found.</p>
          <Link to="/student/jobs">
            <Button variant="primary">Back to Listings</Button>
          </Link>
        </Card>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div className="no-print">
          <Link to="/student/jobs" className="auth-link">
            ← Back to Search
          </Link>
        </div>

        {/* Job Header Info */}
        <Card style={{ padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                borderRadius: 'var(--radius-md)'
              }}>
                🏢
              </div>
              
              <div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{job.title}</h2>
                  <span style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
                    {job.work_mode}
                  </span>
                </div>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Corporate Recruiting Team • ⭐ 4.2 Rating • {job.location}
                </p>
                {job.salary_min && (
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    ₹{parseFloat(job.salary_min).toLocaleString()} - ₹{parseFloat(job.salary_max).toLocaleString()} / year
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={handleToggleSave}>
                {job.isSaved ? '★ Saved' : '☆ Save'}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                Share 🔗
              </Button>
              {job.isApplied ? (
                <Button variant="primary" disabled style={{ backgroundColor: 'var(--success)', border: 'none' }}>
                  Applied ✔
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setApplyModalOpen(true)}>
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* AI Match Analysis Box */}
        {job.aiMatch?.matchPercent > 0 && (
          <Card style={{ padding: '32px', border: '1px solid rgba(16, 185, 129, 0.25)', backgroundColor: 'rgba(16, 185, 129, 0.01)' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {job.aiMatch.matchPercent}%
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--success)' }}>AI Job Match Score</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{job.aiMatch.whySuits}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '6px' }}>Matched Skills:</strong>
                <span>{job.aiMatch.matchedSkills.join(', ') || 'None matching detected.'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--error)', display: 'block', marginBottom: '6px' }}>Recommended Gaps to study:</strong>
                <span>{job.aiMatch.missingSkills.join(', ') || 'None, profile aligns perfectly.'}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Split details layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '32px', alignItems: 'start' }}>
          <Card style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Position Description</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '32px' }}>
              {job.description}
            </p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Requirements</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {job.requirements}
            </p>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Overview */}
            <Card style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Job Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-light)', display: 'block' }}>Employment Type</span>
                  <strong style={{ textTransform: 'capitalize' }}>{job.employment_type.replace('-', ' ')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', display: 'block' }}>Posted Date</span>
                  <strong>{new Date(job.created_at).toLocaleDateString()}</strong>
                </div>
              </div>
            </Card>

            {/* Map Placeholder */}
            <Card style={{ padding: '24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Office Location</h3>
              <div style={{
                height: '140px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-light)',
                fontSize: '0.85rem'
              }}>
                📍 Map Placeholder for {job.location}
              </div>
            </Card>
          </div>
        </div>

      </div>

      {/* Apply Modal */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Apply to ${job.title}`}>
        {resumes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ marginBottom: '20px' }}>Please construct a resume configuration before applying.</p>
            <Link to="/student/resumes">
              <Button variant="primary">Go to Resume Builder</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit}>
            <div className="input-group">
              <label className="input-label">Select Active Resume Version</label>
              <select
                id="applyResume"
                className="input-field"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                style={{ appearance: 'auto' }}
                required
              >
                {resumes.map((res, idx) => (
                  <option key={idx} value={res.id}>{res.title} ({res.template_name})</option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label className="input-label">Cover Letter statement (Optional)</label>
              <textarea
                id="cover"
                className="input-field"
                rows="5"
                placeholder="Briefly state why you are a great fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setApplyModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Application</Button>
            </div>
          </form>
        )}
      </Modal>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </StudentLayout>
  );
};

export default JobDetails;
