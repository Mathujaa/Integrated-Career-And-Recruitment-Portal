import React, { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const CareerRoadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [careerRoles, setCareerRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection States
  const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineer');
  const [generating, setGenerating] = useState(false);

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [rolesRes, roadmapRes] = await Promise.all([
        apiClient.get('/student/career-roles').catch(() => ({ data: { roles: [] } })),
        apiClient.get('/student/roadmap')
      ]);

      if (rolesRes.data.roles && rolesRes.data.roles.length > 0) {
        setCareerRoles(rolesRes.data.roles);
      }

      if (roadmapRes.data.roadmap) {
        const r = roadmapRes.data.roadmap;
        const parsedData = typeof r.roadmap_data === 'string' ? JSON.parse(r.roadmap_data) : r.roadmap_data;
        setRoadmap({ ...r, roadmap_data: parsedData });
        setCareerGoal(r.career_goal);
      }
    } catch (err) {
      console.error('Failed to load career goal data:', err);
      showToast('Failed to load career goals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleGenerate = async (targetGoal) => {
    const selected = targetGoal || careerGoal;
    setGenerating(true);
    try {
      const res = await apiClient.post('/student/roadmap/generate', { career_goal: selected });
      if (res.data.roadmap) {
        const r = res.data.roadmap;
        const parsed = typeof r.roadmap_data === 'string' ? JSON.parse(r.roadmap_data) : r.roadmap_data;
        setRoadmap({ ...r, roadmap_data: parsed });
        setCareerGoal(r.career_goal);
      }
      showToast('Personalized career roadmap generated based on your profile!');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate personalized roadmap.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStep = async (stepId, isCurrentlyCompleted) => {
    if (!roadmap) return;
    try {
      const res = await apiClient.post('/student/roadmap/milestone/toggle', {
        milestoneId: stepId,
        completed: !isCurrentlyCompleted
      });
      if (res.data.roadmap) {
        const r = res.data.roadmap;
        const parsed = typeof r.roadmap_data === 'string' ? JSON.parse(r.roadmap_data) : r.roadmap_data;
        setRoadmap({ ...r, roadmap_data: parsed });
      }
      showToast(isCurrentlyCompleted ? 'Milestone marked as pending.' : 'Milestone marked as completed! 🎉');
    } catch (err) {
      console.error(err);
      showToast('Failed to update milestone status.', 'error');
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

  const rData = roadmap?.roadmap_data;
  const milestones = Array.isArray(rData) ? rData : (rData?.milestones || []);
  const gapAnalysis = rData?.gapAnalysis;

  return (
    <StudentLayout>
      <div className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Career Goals & Learning Roadmap</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Personalized study milestones dynamically mapped against your skills, projects, and target placement role.
          </p>
        </div>

        {!roadmap || milestones.length === 0 ? (
          <Card style={{ padding: '40px', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px' }}>🗺</span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '8px' }}>Select Your Target Career Goal</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
              Choose the role you want to be placed in. Our system analyzes your current skills and projects to build a custom roadmap.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
              <select
                className="input-field"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                style={{ appearance: 'auto' }}
              >
                {careerRoles.map((role, idx) => (
                  <option key={idx} value={role.name}>{role.name}</option>
                ))}
              </select>
              <Button variant="primary" onClick={() => handleGenerate(careerGoal)} loading={generating}>
                Generate Personalized Roadmap
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '32px', alignItems: 'start' }}>
            
            {/* Timeline Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Skill Gap Analysis Banner */}
              {gapAnalysis && (
                <Card style={{ padding: '24px', backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Target Role Skill Assessment</h3>
                    <span style={{
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      color: 'var(--primary)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {gapAnalysis.acquiredSkills?.length || 0} / {(gapAnalysis.acquiredSkills?.length || 0) + (gapAnalysis.missingSkills?.length || 0)} Skills Verified
                    </span>
                  </div>

                  {gapAnalysis.acquiredSkills && gapAnalysis.acquiredSkills.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)', marginBottom: '8px' }}>
                        ✔ Skills You Already Possess:
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {gapAnalysis.acquiredSkills.map((s, idx) => (
                          <span key={idx} style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            color: 'var(--success)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {gapAnalysis.missingSkills && gapAnalysis.missingSkills.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--error)', marginBottom: '8px' }}>
                        ⚡ Missing Skills to Acquire for {roadmap.career_goal}:
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {gapAnalysis.missingSkills.map((s, idx) => (
                          <span key={idx} style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--error)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Learning Milestones List */}
              <Card style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Learning Milestones</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Check milestones off as you complete them to track your placement readiness.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {milestones.filter(m => m.completed).length} of {milestones.length} Completed
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {milestones.map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start',
                        padding: '16px',
                        backgroundColor: step.completed ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-main)',
                        borderRadius: 'var(--radius-md)',
                        border: step.completed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-light)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(step.completed)}
                        onChange={() => handleToggleStep(step.id, step.completed)}
                        style={{ width: '22px', height: '22px', marginTop: '2px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                        id={`milestone-${step.id}`}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                          <label
                            htmlFor={`milestone-${step.id}`}
                            style={{
                              fontSize: '1.05rem',
                              fontWeight: 700,
                              margin: 0,
                              cursor: 'pointer',
                              textDecoration: step.completed ? 'line-through' : 'none',
                              color: step.completed ? 'var(--text-light)' : 'var(--text-main)'
                            }}
                          >
                            Milestone {step.id}: {step.title}
                          </label>
                          {step.estimated_duration && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                              ⏱ {step.estimated_duration}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                          {step.desc}
                        </p>
                        {step.resources && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                            📚 <strong>Recommended Resources:</strong> {step.resources}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

            {/* Goal Overview Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Dynamic Goal Progress Card */}
              <Card style={{ padding: '28px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Target Placement Role
                </h3>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '20px' }}>
                  {roadmap.career_goal}
                </h4>
                
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  margin: '0 auto 16px auto',
                  border: '4px solid rgba(79, 70, 229, 0.2)'
                }}>
                  {roadmap.progress_percent}%
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                  Calculated dynamically from completed milestones
                </p>
                
                <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${roadmap.progress_percent}%`,
                    backgroundColor: roadmap.progress_percent === 100 ? 'var(--success)' : 'var(--primary)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
              </Card>

              {/* Options to switch/regenerate goal */}
              <Card style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Change Target Role</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Select a different career goal to generate an updated roadmap matching your skills to the new target.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <select
                    className="input-field"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    style={{ appearance: 'auto', margin: 0 }}
                  >
                    {careerRoles.map((role, idx) => (
                      <option key={idx} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                  <Button variant="primary" onClick={() => handleGenerate(careerGoal)} loading={generating}>
                    Generate New Roadmap
                  </Button>
                </div>
              </Card>

            </div>

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

export default CareerRoadmap;
