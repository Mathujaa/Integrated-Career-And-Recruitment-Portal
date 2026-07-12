import React, { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const AIMentor = () => {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAdvice();
  }, []);

  const fetchAdvice = async () => {
    try {
      const response = await apiClient.get('/student/ai-mentor/advice');
      setAdvice(response.data.advice);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load mentorship suggestions.');
    } finally {
      setLoading(false);
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
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Career Mentor</h2>
          <p style={{ color: 'var(--text-muted)' }}>Get personalized career suggestions, study roadmap details, and interview preparation checklists.</p>
        </div>

        {errorMsg && (
          <div className="card input-error-border" style={{ color: 'var(--error)' }}>
            {errorMsg}
          </div>
        )}

        {advice && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start' }}>
            
            {/* Left Column: Learning Roadmap & Tips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Learning Roadmap steps timeline */}
              <Card style={{ padding: '36px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px' }}>Recommended Study Roadmap</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                  {advice.learningPath.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        zIndex: 2,
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '4px 0 6px 0' }}>{step.step}</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Duration: {step.duration}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px' }}>Source: {step.resources}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Interview Preparation tips checklist */}
              <Card style={{ padding: '36px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Interview Preparation Checklist</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {advice.interviewTips.map((tip, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '1.2rem', color: 'var(--success)' }}>✔</span>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column: Skill Gaps and Career advice summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Skill gap analysis tags */}
              <Card style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Skill Gap Analysis</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Based on target market trends and job requirements, adding these tags to your profile will boost matching scores by 25%.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {advice.skillGap.map((s, idx) => (
                    <span key={idx} style={{
                      backgroundColor: 'rgba(79, 70, 229, 0.08)',
                      color: 'var(--primary)',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      + {s}
                    </span>
                  ))}
                </div>
              </Card>

              {/* General mentor suggestions */}
              <Card style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Mentor Insights</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {advice.suggestions.map((s, i) => (
                    <p key={i} style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      💡 {s}
                    </p>
                  ))}
                </div>
              </Card>
            </div>

          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default AIMentor;
