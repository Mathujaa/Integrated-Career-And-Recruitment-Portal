import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const AdminAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResults, setSelectedResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchAssessments(); }, []);

  const fetchAssessments = async () => {
    try {
      const res = await apiClient.get('/admin/assessments');
      setAssessments(res.data.assessments);
    } catch (err) {
      console.error(err);
      showToast('Failed to load assessments list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleDelete = async (assessmentId) => {
    if (!window.confirm('Are you sure? This will permanently delete the assessment and ALL student results.')) return;
    try {
      await apiClient.delete(`/admin/assessments/${assessmentId}`);
      showToast('Assessment and all results permanently deleted.');
      setSelectedResults(null);
      fetchAssessments();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete assessment.', 'error');
    }
  };

  const handleViewResults = async (assessment) => {
    setResultsLoading(true);
    setSelectedResults(null);
    try {
      const res = await apiClient.get(`/admin/assessments/${assessment.id}/results`);
      setSelectedResults({ assessment, attempts: res.data.results });
    } catch (err) {
      console.error(err);
      showToast('Failed to load assessment results.', 'error');
    } finally {
      setResultsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <AdminLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>📝 Skill Assessments Audit</h2>
          <p style={{ color: 'var(--text-muted)' }}>Audit published quiz files, check test statistics, and inspect score leaderboards.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}><Spinner size="md" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

            {/* Left: Assessment List */}
            <Card style={{ padding: '24px', flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
                Active Assessment Questionnaires
                <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  ({assessments.length} total)
                </span>
              </h3>
              {assessments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '32px 0' }}>No assessments registered.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {assessments.map(ass => (
                    <div
                      key={ass.id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--bg-main)',
                        borderRadius: 'var(--radius-md)',
                        border: selectedResults?.assessment?.id === ass.id
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <div style={{ marginBottom: '10px' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '0.95rem' }}>{ass.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ass.category} · {ass.questions_count || 0} Qs · {ass.duration_minutes || 20} min ·
                          Passing: {ass.passing_score || 60}%
                        </span>
                        {(ass.attempts_count > 0) && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '2px' }}>
                            {ass.attempts_count} attempts · Avg: {ass.avg_score || 0}%
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          variant="outline"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={() => handleViewResults(ass)}
                        >
                          View Results
                        </Button>
                        <Button
                          variant="outline"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#EF4444', borderColor: '#EF4444' }}
                          onClick={() => handleDelete(ass.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Right: Results Leaderboard */}
            <Card style={{ padding: '24px', flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Leaderboard & Results</h3>

              {resultsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}><Spinner size="sm" /></div>
              ) : !selectedResults ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '40px 0', fontSize: '0.9rem' }}>
                  Select an assessment on the left to view the scores leaderboard.
                </p>
              ) : (
                <div>
                  <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--primary)' }}>
                      {selectedResults.assessment.title}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {selectedResults.attempts.length} candidate submissions · Passing score: {selectedResults.assessment.passing_score}%
                    </span>
                  </div>

                  {selectedResults.attempts.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', margin: '32px 0' }}>
                      No student has submitted this assessment yet.
                    </p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-light)' }}>
                            <th style={{ padding: '8px 10px' }}>Rank</th>
                            <th style={{ padding: '8px 10px' }}>Candidate</th>
                            <th style={{ padding: '8px 10px' }}>Score</th>
                            <th style={{ padding: '8px 10px' }}>%</th>
                            <th style={{ padding: '8px 10px' }}>Time</th>
                            <th style={{ padding: '8px 10px' }}>Status</th>
                            <th style={{ padding: '8px 10px' }}>Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedResults.attempts.map((attempt, index) => (
                            <tr key={attempt.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '8px 10px', fontWeight: 'bold', color: index < 3 ? '#F59E0B' : 'inherit' }}>
                                #{index + 1}
                              </td>
                              <td style={{ padding: '8px 10px' }}>
                                <span style={{ display: 'block', fontWeight: 600 }}>{attempt.first_name} {attempt.last_name}</span>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{attempt.email}</span>
                              </td>
                              <td style={{ padding: '8px 10px', fontWeight: 'bold', color: 'var(--secondary)' }}>
                                {attempt.score}
                              </td>
                              <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>
                                {parseFloat(attempt.percentage || 0).toFixed(1)}%
                              </td>
                              <td style={{ padding: '8px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                {formatTime(attempt.time_taken_seconds)}
                              </td>
                              <td style={{ padding: '8px 10px' }}>
                                <span style={{
                                  padding: '2px 6px', borderRadius: '8px',
                                  fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                                  backgroundColor: attempt.status === 'pass' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                  color: attempt.status === 'pass' ? '#10B981' : '#EF4444'
                                }}>
                                  {attempt.status}
                                </span>
                              </td>
                              <td style={{ padding: '8px 10px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                {new Date(attempt.created_at).toLocaleDateString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
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

export default AdminAssessments;
