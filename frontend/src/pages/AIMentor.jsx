import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const AIMentor = () => {
  const [advice, setAdvice] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchAdvice();
  }, []);

  const fetchAdvice = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await apiClient.get('/student/ai-mentor/advice');
      const data = response.data.advice;
      setAdvice(data);
      setChecklist(data.interviewChecklist || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Unable to generate mentorship recommendations. Please ensure your profile is complete.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await apiClient.get('/student/ai-mentor/advice');
      const data = response.data.advice;
      setAdvice(data);
      setChecklist(data.interviewChecklist || []);
      showToast('Mentorship guidance refreshed with latest profile data!');
    } catch (err) {
      showToast('Failed to refresh guidance.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleChecklistItem = async (itemId, isCompleted) => {
    // Optimistic UI update
    const updated = checklist.map(item => {
      if (item.id === itemId) return { ...item, completed: !isCompleted };
      return item;
    });
    setChecklist(updated);

    try {
      const res = await apiClient.post('/student/roadmap/checklist/toggle', {
        itemId,
        completed: !isCompleted
      });
      if (res.data.interviewChecklist) {
        setChecklist(res.data.interviewChecklist);
      }
      showToast(!isCompleted ? 'Interview topic marked as prepared! ✔' : 'Topic marked as pending.');
    } catch (err) {
      console.error('Failed to sync checklist item:', err);
      showToast('Failed to save checklist progress.', 'error');
      setChecklist(checklist);
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

  const completedChecklistCount = checklist.filter(c => c.completed).length;
  const checklistPercent = checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;

  return (
    <StudentLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header with Title and Quick Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Career Mentor</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Intelligent career advisor providing personalized guidance, resource recommendations, and interview prep for <strong>{advice?.candidateName || 'Candidate'}</strong>.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/student/roadmap" style={{ textDecoration: 'none' }}>
              <Button variant="outline">
                🗺️ Career Goals & Roadmaps
              </Button>
            </Link>
            <Button variant="primary" onClick={handleRefresh} loading={refreshing}>
              🔄 Refresh Insights
            </Button>
          </div>
        </div>

        {errorMsg && (
          <div className="card input-error-border" style={{ color: 'var(--error)', padding: '24px' }}>
            {errorMsg}
          </div>
        )}

        {advice && (
          <>
            {/* Top Overview Banner: Active Placement Track & Diagnosis */}
            <Card style={{ padding: '28px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Active Placement Track (Shared with Career Goals)
                  </span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0 8px 0' }}>
                    {advice.targetRole}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                    Recommendations adapt dynamically whenever you update your target role or milestone progress in Career Goals.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: advice.matchScore >= 50 ? 'var(--success)' : 'var(--primary)' }}>
                      {advice.matchScore}%
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Role Skill Match</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: checklistPercent === 100 ? 'var(--success)' : 'var(--secondary)' }}>
                      {checklistPercent}%
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Interview Readiness</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 1. Next Best Learning Activity (Highlighted Action Step) */}
            {advice.nextBestActivity && (
              <Card style={{
                padding: '28px',
                borderLeft: '6px solid var(--primary)',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.04) 0%, rgba(79, 70, 229, 0.01) 100%)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🎯</span>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Recommended Next Best Learning Activity
                      </span>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0' }}>
                        {advice.nextBestActivity.title}
                      </h3>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      color: 'var(--primary)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {advice.nextBestActivity.category}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-muted)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-light)'
                    }}>
                      ⏱ {advice.nextBestActivity.estimatedEffort}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
                  {advice.nextBestActivity.reason}
                </p>

                {advice.nextBestActivity.actionSteps && advice.nextBestActivity.actionSteps.length > 0 && (
                  <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                      Recommended Action Steps:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {advice.nextBestActivity.actionSteps.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link to="/student/roadmap" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                      Track in Career Goals →
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

            {/* Main Content 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start' }}>
              
              {/* Left Column: Learning Resources & Suggested Projects */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* 2. Recommended Relevant Learning Resources */}
                <Card style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                      📚 Recommended Learning Resources
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Tailored to your skill gaps
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Curated technical references, interactive platforms, and engineering handbooks mapped to <strong>{advice.targetRole}</strong>.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {advice.recommendedResources && advice.recommendedResources.length > 0 ? (
                      advice.recommendedResources.map((res, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '16px',
                            backgroundColor: 'var(--bg-main)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: 'rgba(79, 70, 229, 0.1)',
                              color: 'var(--primary)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              {res.skill}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                              {res.type}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '2px 0', color: 'var(--text-main)' }}>
                            {res.title}
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                            {res.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No pending learning resources needed.</p>
                    )}
                  </div>
                </Card>

                {/* 3. Suggested Projects Based on Skill Gaps */}
                <Card style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                      🛠️ Suggested Projects (Skill Gap Bridging)
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Standout portfolio blueprints
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Practical project architectures designed to showcase both your existing proficiencies and close missing recruiter requirements.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {advice.suggestedProjects && advice.suggestedProjects.map((proj, pIdx) => (
                      <div
                        key={pIdx}
                        style={{
                          padding: '20px',
                          backgroundColor: 'var(--bg-main)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                            {proj.title}
                          </h4>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: proj.difficulty === 'Advanced' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                            color: proj.difficulty === 'Advanced' ? 'var(--error)' : 'var(--primary)'
                          }}>
                            {proj.difficulty}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                          {proj.description}
                        </p>

                        {/* Tech Stack Pills */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          {proj.techStack.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-light)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                color: 'var(--text-main)'
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Key Features */}
                        <div style={{ backgroundColor: 'var(--bg-card)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Key Implementation Features:
                          </span>
                          <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '0.83rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {proj.keyFeatures.map((feat, fIdx) => (
                              <li key={fIdx}>{feat}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 4. Role-Specific Interview Questions & Guidance */}
                <Card style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                      💬 Technical & Behavioral Interview Questions
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Frequently asked in screenings
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Deep technical defense questions tailored to <strong>{advice.targetRole}</strong> rounds with guidance on what interviewers look for.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {advice.interviewQuestions && advice.interviewQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        style={{
                          padding: '16px',
                          backgroundColor: 'var(--bg-main)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            backgroundColor: 'rgba(79, 70, 229, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {q.category}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            Level: {q.difficulty}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0 8px 0', lineHeight: 1.5 }}>
                          "{q.question}"
                        </h4>
                        <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Talking Points / Rubric:
                          </span>
                          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                            {q.guidance}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

              </div>

              {/* Right Column: Skill Gap Analysis, Mentor Advice & Interactive Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* 5. Skill Gap Analysis */}
                <Card style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                    Skill Gap Analysis
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Comparing your profile skills against industry requirements for <strong>{advice.targetRole}</strong>.
                  </p>

                  {advice.acquiredSkills && advice.acquiredSkills.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', marginBottom: '8px' }}>
                        ✔ Verified on Your Profile:
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {advice.acquiredSkills.map((s, idx) => (
                          <span key={idx} style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            color: 'var(--success)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {advice.skillGap && advice.skillGap.length > 0 ? (
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--error)', marginBottom: '8px' }}>
                        ⚡ High-Impact Missing Skills:
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {advice.skillGap.map((s, idx) => (
                          <span key={idx} style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--error)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            + {s}
                          </span>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '12px' }}>
                        💡 Tip: Complete the suggested projects and add these skills to your profile.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                      🎉 Excellent! You have covered core requirements for this position.
                    </p>
                  )}
                </Card>

                {/* 6. Personalized Mentor Advice & Strategy */}
                <Card style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
                    Personalized Mentor Insights
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {advice.suggestions.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          {s}
                        </p>
                      </div>
                    ))}
                  </div>

                  {advice.interviewTips && advice.interviewTips.length > 0 && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                        Strategic Focus:
                      </h4>
                      <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.83rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {advice.interviewTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* 7. Interactive Interview Checklist */}
                <Card style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                        Interview Checklist
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Track topics you feel confident defending.
                      </p>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {completedChecklistCount} of {checklist.length}
                    </span>
                  </div>

                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border-light)', borderRadius: '3px', marginBottom: '16px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${checklistPercent}%`,
                      backgroundColor: checklistPercent === 100 ? 'var(--success)' : 'var(--primary)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {checklist.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                          padding: '10px 14px',
                          backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-main)',
                          borderRadius: 'var(--radius-md)',
                          border: item.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-light)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(item.completed)}
                          onChange={() => handleToggleChecklistItem(item.id, item.completed)}
                          style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                          id={`checklist-${item.id}`}
                        />
                        <div style={{ flex: 1 }}>
                          <label
                            htmlFor={`checklist-${item.id}`}
                            style={{
                              margin: 0,
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              color: item.completed ? 'var(--text-light)' : 'var(--text-main)',
                              textDecoration: item.completed ? 'line-through' : 'none'
                            }}
                          >
                            {item.topic}
                          </label>
                          {item.category && (
                            <span style={{
                              display: 'inline-block',
                              marginLeft: '8px',
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)',
                              backgroundColor: 'var(--bg-card)',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

              </div>

            </div>
          </>
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

export default AIMentor;
