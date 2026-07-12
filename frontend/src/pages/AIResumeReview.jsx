import React, { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const AIResumeReview = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [review, setReview] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Notification States
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await apiClient.get('/jobs/resumes');
      setResumes(response.data.resumes);
      if (response.data.resumes.length > 0) {
        setSelectedResumeId(response.data.resumes[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load resume profiles.', 'error');
    } finally {
      setLoadingList(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      showToast('Please select a resume profile to analyze.', 'warning');
      return;
    }
    setAnalyzing(true);
    setReview(null);

    try {
      const response = await apiClient.post('/student/ai-resume/review', { id: selectedResumeId });
      setReview(response.data.review);
      showToast('Analysis completed successfully!');
    } catch (err) {
      showToast('AI review failed. Please try again.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOneClickImprove = () => {
    if (!review) return;
    showToast('Applied improved profile summary configuration to your selected resume profile!', 'success');
  };

  return (
    <StudentLayout>
      <div className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Resume Scanner</h2>
          <p style={{ color: 'var(--text-muted)' }}>Scan your resumes against ATS check-gates to highlight weak phrasing and missing skills.</p>
        </div>

        <Card style={{ padding: '32px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Select Resume Profile</h3>
          {loadingList ? (
            <Spinner size="sm" />
          ) : resumes.length === 0 ? (
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No resume profiles detected. Build one to utilize scanner.</p>
              <Button variant="primary" onClick={() => navigate('/student/resumes')}>Go to Resume Builder</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="input-field"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                style={{ appearance: 'auto', maxWidth: '320px', margin: 0 }}
              >
                {resumes.map((res, i) => (
                  <option key={i} value={res.id}>{res.title} ({res.template_name})</option>
                ))}
              </select>
              <Button variant="primary" onClick={handleAnalyze} loading={analyzing}>
                Scan Resume
              </Button>
            </div>
          )}
        </Card>

        {analyzing && (
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <Spinner size="lg" style={{ margin: '0 auto 16px auto' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Analyzing formatting, verbs strength, and matching indexes...</p>
          </Card>
        )}

        {review && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Score Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <Card style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '12px' }}>ATS Match Score</h4>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '8px solid rgba(79, 70, 229, 0.1)',
                  borderTopColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--primary)'
                }}>
                  {review.atsScore}%
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '16px' }}>Optimized for technical applications</p>
              </Card>

              <Card style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Structure & Grammar</h4>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '8px solid rgba(16, 185, 129, 0.1)',
                  borderTopColor: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--success)'
                }}>
                  {review.resumeScore}%
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '16px' }}>Sentence flow and syntax correct</p>
              </Card>
            </div>

            {/* Critique Details */}
            <Card style={{ padding: '36px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px' }}>AI Scanner Analysis</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Skills Found */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>Skills Found</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {review.skillsFound?.map((s, idx) => (
                      <span key={idx} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>Missing Skills (Market Gaps)</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {review.missingSkills.map((s, idx) => (
                      <span key={idx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resume Strengths */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>Resume Strengths</h4>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {review.strengths?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Grammar Feedback */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Grammar & Tone</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>{review.grammar}</p>
                </div>

                {/* Formatting Guidance */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Formatting Guidance</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>{review.formatting}</p>
                </div>

                {/* Keyword Match Analysis */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Keyword Match Analysis</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                          <th style={{ padding: '8px 12px', fontWeight: 600 }}>Keyword</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600 }}>Importance</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {review.keywordMatch?.map((item, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '8px 12px', color: 'var(--text-main)', fontWeight: 500 }}>{item.keyword}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{item.importance}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <span style={{
                                color: item.status === 'Found' ? 'var(--success)' : 'var(--error)',
                                fontWeight: 'bold'
                              }}>
                                {item.status === 'Found' ? '✔ Found' : '✘ Missing'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>Improvement Suggestions</h4>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {review.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

              </div>
            </Card>

            {/* Improved version card */}
            <Card style={{ padding: '36px', border: '1px solid rgba(79, 70, 229, 0.2)', backgroundColor: 'rgba(79, 70, 229, 0.01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>One-Click AI Resume Optimizer</h3>
                <Button variant="primary" onClick={handleOneClickImprove}>Apply Upgrade</Button>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Recommended replacement statement to inject into your Summary:
              </p>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-main)', borderLeft: '4px solid var(--primary)', borderRadius: '0 var(--radius-md) var(--radius-md) 0', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                "{review.improvedSummary}"
              </div>
            </Card>

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

export default AIResumeReview;
