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
  const [loading, setLoading] = useState(true);
  
  // Selection States
  const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineer');
  const [generating, setGenerating] = useState(false);

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const defaultRoadmaps = {
    'Full Stack Software Engineer': [
      { id: 1, title: 'Frontend Core Fundamentals', desc: 'Master JavaScript (ES6+), semantic HTML5, and responsive vanilla CSS grid/flex layout designs.', completed: true },
      { id: 2, title: 'React components architecture', desc: 'Learn component state management, hooks lifecycle, prop drilling solutions, and context APIs.', completed: true },
      { id: 3, title: 'Server-Side endpoints coding', desc: 'Build scalable APIs using NodeJS, Express handlers, database connection pools, and authentication guards.', completed: false },
      { id: 4, title: 'Database modeling & indexing', desc: 'Write relations schemas, join queries, and configure optimal indexes in MySQL/PostgreSQL.', completed: false },
      { id: 5, title: 'Cloud Deployments & Git workflows', desc: 'Configure Docker builds, set up GitHub actions CI/CD, and deploy targets onto AWS EC2 clusters.', completed: false }
    ],
    'Frontend Developer': [
      { id: 1, title: 'HTML & CSS Mastery', desc: 'Learn layout structures, typography rules, HSL color models, and CSS variables.', completed: true },
      { id: 2, title: 'JavaScript Essentials', desc: 'Study async execution paths, API fetch callbacks, microtask queues, and DOM selectors.', completed: true },
      { id: 3, title: 'React Hooks & State Management', desc: 'Integrate context stores, caching queries, and modular hook extensions.', completed: false },
      { id: 4, title: 'CSS Preprocessors & Frameworks', desc: 'Incorporate Tailwind, Sass/Less styling variables, and modular CSS systems.', completed: false }
    ],
    'Backend Engineer': [
      { id: 1, title: 'Data Structures & Algorithms', desc: 'Understand array indexing, linked structures, tree traversals, and algorithms runtimes.', completed: true },
      { id: 2, title: 'Express NodeJS Servers', desc: 'Code route handlers, custom logger middleware, CORS configurations, and error catching.', completed: true },
      { id: 3, title: 'Relational Database Queries', desc: 'Implement transactions locks, foreign constraints, and optimized joins in MySQL.', completed: false },
      { id: 4, title: 'Caching & Message Brokers', desc: 'Incorporate Redis key structures, BullMQ worker processes, and RabbitMQ events.', completed: false }
    ]
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const response = await apiClient.get('/student/roadmap');
      if (response.data.roadmap) {
        const r = response.data.roadmap;
        setRoadmap({
          ...r,
          roadmap_data: typeof r.roadmap_data === 'string' ? JSON.parse(r.roadmap_data) : r.roadmap_data
        });
        setCareerGoal(r.career_goal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const steps = defaultRoadmaps[careerGoal] || defaultRoadmaps['Full Stack Software Engineer'];
    const payload = {
      career_goal: careerGoal,
      progress_percent: Math.round((steps.filter(s => s.completed).length / steps.length) * 100),
      roadmap_data: steps
    };

    try {
      await apiClient.post('/student/roadmap', payload);
      showToast('Career roadmap generated successfully!');
      fetchRoadmap();
    } catch (err) {
      showToast('Failed to save roadmap details.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStep = async (stepId, isCurrentlyCompleted) => {
    if (!roadmap) return;
    
    const updatedSteps = roadmap.roadmap_data.map(step => {
      if (step.id === stepId) {
        return { ...step, completed: !isCurrentlyCompleted };
      }
      return step;
    });

    const progress = Math.round((updatedSteps.filter(s => s.completed).length / updatedSteps.length) * 100);
    const payload = {
      career_goal: roadmap.career_goal,
      progress_percent: progress,
      roadmap_data: updatedSteps
    };

    try {
      await apiClient.post('/student/roadmap', payload);
      showToast('Milestone status updated.');
      fetchRoadmap();
    } catch (err) {
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

  return (
    <StudentLayout>
      <div className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Career Goals & Roadmap</h2>
          <p style={{ color: 'var(--text-muted)' }}>Generate customized study steps mapping your skills profile to specific career roles.</p>
        </div>

        {!roadmap ? (
          <Card style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🗺</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Generate Career Roadmap</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
              Select your placement target. Our assistant will compute required milestones and list study guidelines.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '360px', margin: '0 auto' }}>
              <select
                className="input-field"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                style={{ appearance: 'auto' }}
              >
                <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Engineer">Backend Engineer</option>
              </select>
              <Button variant="primary" onClick={handleGenerate} loading={generating}>
                Generate Active Roadmap
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '32px', alignItems: 'start' }}>
            
            {/* Timeline Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card style={{ padding: '36px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px' }}>Learning Milestones</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {roadmap.roadmap_data.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        checked={step.completed}
                        onChange={() => handleToggleStep(step.id, step.completed)}
                        style={{ width: '20px', height: '20px', marginTop: '4px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          margin: '0 0 6px 0',
                          textDecoration: step.completed ? 'line-through' : 'none',
                          color: step.completed ? 'var(--text-light)' : 'var(--text-main)'
                        }}>
                          {step.title}
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Goal Overview Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card style={{ padding: '28px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Target Placement</h3>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '20px' }}>{roadmap.career_goal}</h4>
                
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  margin: '0 auto 16px auto'
                }}>
                  {roadmap.progress_percent}%
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Goal progress percentage</p>
                <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border-light)', borderRadius: '3px', marginTop: '12px' }}>
                  <div style={{ height: '100%', width: `${roadmap.progress_percent}%`, backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
                </div>
              </Card>

              {/* Options to regenerate goal */}
              <Card style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Switch Placement Goal</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <select
                    className="input-field"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    style={{ appearance: 'auto', margin: 0 }}
                  >
                    <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                  </select>
                  <Button variant="outline" onClick={handleGenerate} loading={generating}>
                    Re-Generate Roadmap
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
