import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await apiClient.get('/jobs/applications');
      setApplications(response.data.applications);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load job applications history.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return '#3b82f6';
      case 'under_review': return '#f59e0b';
      case 'shortlisted': return '#7c3aed';
      case 'offered':
      case 'hired': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#64748b';
    }
  };

  // Convert status to timeline step active index (1 to 5)
  const getTimelineStep = (status) => {
    if (status === 'rejected') return -1;
    switch (status) {
      case 'submitted': return 1;
      case 'under_review': return 2;
      case 'shortlisted': return 3;
      case 'offered':
      case 'hired': return 4;
      default: return 1;
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

  return (
    <StudentLayout>
      <div className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Job Applications</h2>
          <p style={{ color: 'var(--text-muted)' }}>Track the real-time review, shortlisting, and offer statuses of your applications.</p>
        </div>

        {errorMsg && (
          <div className="card input-error-border" style={{ color: 'var(--error)', marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        {applications.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <p>You have not submitted any job applications yet.</p>
            <Link to="/student/jobs" style={{ marginTop: '16px', display: 'inline-block' }}>
              <span className="auth-link">Search active job openings →</span>
            </Link>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {applications.map((app, idx) => {
              const activeStep = getTimelineStep(app.application_status);
              return (
                <Card key={idx} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Top Header details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                          <Link to={`/student/jobs/${app.id}`} style={{ color: 'var(--text-main)' }}>
                            {app.title}
                          </Link>
                        </h4>
                        <span style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                          {app.work_mode}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                        Recruiting Company • {app.location} • Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: `${getStatusColor(app.application_status)}12`,
                        color: getStatusColor(app.application_status),
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {app.application_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Timeline Progress */}
                  {activeStep !== -1 ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '16px 0', padding: '0 10px' }}>
                      {/* Grey background connecting line */}
                      <div style={{ position: 'absolute', top: '15px', left: '20px', right: '20px', height: '2px', backgroundColor: 'var(--border-light)', zIndex: 1 }}></div>
                      
                      {/* Active green/blue progress line */}
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '20px',
                        width: `${((activeStep - 1) / 3) * 94}%`,
                        height: '2px',
                        backgroundColor: 'var(--primary)',
                        zIndex: 1,
                        transition: 'width var(--transition-normal)'
                      }}></div>

                      {['Applied', 'Review', 'Shortlist', 'Offer'].map((stepName, stepIdx) => {
                        const stepNum = stepIdx + 1;
                        const isDone = stepNum <= activeStep;
                        return (
                          <div key={stepIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? 'var(--primary)' : 'var(--bg-main)',
                              border: '2px solid',
                              borderColor: isDone ? 'var(--primary)' : 'var(--border-light)',
                              color: isDone ? '#FFFFFF' : 'var(--text-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.85rem',
                              transition: 'all var(--transition-fast)'
                            }}>
                              {isDone ? '✔' : stepNum}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isDone ? 'var(--text-main)' : 'var(--text-light)', marginTop: '8px' }}>
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--error)' }}>
                      <strong>Application Status: Rejected</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>We appreciate your interest. The recruiting team has decided to proceed with other profiles at this time.</p>
                    </div>
                  )}

                  {/* Recruiter Notes or details */}
                  {app.cover_letter && (
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Submitted Statement:</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                        "{app.cover_letter}"
                      </p>
                    </div>
                  )}

                </Card>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default AppliedJobs;
