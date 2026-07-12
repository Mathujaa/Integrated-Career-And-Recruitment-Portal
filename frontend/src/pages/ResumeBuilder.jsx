import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const ResumeBuilder = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorMode, setEditorMode] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState(null);

  // Resume form fields
  const [resumeTitle, setResumeTitle] = useState('My Resume');
  const [templateName, setTemplateName] = useState('classic');
  const [summary, setSummary] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customSections, setCustomSections] = useState([]);

  // Modal controllers
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projForm, setProjForm] = useState({ title: '', role: '', description: '', link: '' });
  
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customForm, setCustomForm] = useState({ header: '', body: '' });

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Auto-Save reference timer
  const autoSaveTimerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // Trigger auto-save when values change in editor mode
  useEffect(() => {
    if (!editorMode) return;
    
    // Clear previous timer
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    // Set new auto-save timer (e.g. 5 seconds of typing silence)
    autoSaveTimerRef.current = setTimeout(() => {
      executeAutoSave();
    }, 5000);

  }, [resumeTitle, templateName, summary, skillsText, educations, experiences, projects, customSections]);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/jobs/resumes');
      setResumes(response.data.resumes);
    } catch (err) {
      console.error(err);
      showToast('Failed to load resumes list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const executeAutoSave = async () => {
    if (!editorMode) return;
    const payload = {
      title: resumeTitle,
      template_name: templateName,
      resume_data: {
        summary,
        skills: skillsText,
        educations,
        experiences,
        projects,
        customSections
      }
    };

    try {
      if (currentResumeId) {
        await apiClient.put(`/jobs/resumes/${currentResumeId}`, payload);
        console.log('✔ Resume auto-saved successfully.');
      }
    } catch (err) {
      console.warn('Auto-save failed:', err.message);
    }
  };

  const handleCreateNew = async () => {
    try {
      const profileRes = await apiClient.get('/student/profile');
      const p = profileRes.data.profile;
      
      setResumeTitle('New Resume');
      setTemplateName('classic');
      setSummary(p.bio || '');
      setSkillsText(p.skills?.map(s => s.name).join(', ') || '');
      setEducations(p.educations?.map(e => ({
        school: e.institution_name,
        degree: e.degree,
        field: e.field_of_study,
        start: e.start_date.substring(0, 10),
        end: e.end_date ? e.end_date.substring(0, 10) : 'Present'
      })) || []);
      setExperiences(p.experiences?.map(exp => ({
        company: exp.company_name,
        role: exp.job_title,
        start: exp.start_date.substring(0, 10),
        end: exp.is_current ? 'Present' : exp.end_date ? exp.end_date.substring(0, 10) : ''
      })) || []);
      setProjects([]);
      setCustomSections([]);
      setCurrentResumeId(null);
      setEditorMode(true);
    } catch (err) {
      setResumeTitle('My Resume');
      setTemplateName('classic');
      setSummary('');
      setSkillsText('');
      setEducations([]);
      setExperiences([]);
      setProjects([]);
      setCustomSections([]);
      setCurrentResumeId(null);
      setEditorMode(true);
    }
  };

  const handleEdit = async (resume) => {
    setCurrentResumeId(resume.id);
    setResumeTitle(resume.title);
    setTemplateName(resume.template_name);
    
    const rData = typeof resume.resume_data === 'string' ? JSON.parse(resume.resume_data) : resume.resume_data;
    setSummary(rData.summary || '');
    setSkillsText(rData.skills || '');
    setEducations(rData.educations || []);
    setExperiences(rData.experiences || []);
    setProjects(rData.projects || []);
    setCustomSections(rData.customSections || []);
    
    setEditorMode(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await apiClient.delete(`/jobs/resumes/${id}`);
      showToast('Resume deleted successfully.');
      fetchResumes();
    } catch (err) {
      showToast('Failed to delete resume.', 'error');
    }
  };

  const handleSaveResume = async () => {
    const payload = {
      title: resumeTitle,
      template_name: templateName,
      resume_data: {
        summary,
        skills: skillsText,
        educations,
        experiences,
        projects,
        customSections
      }
    };

    try {
      if (currentResumeId) {
        await apiClient.put(`/jobs/resumes/${currentResumeId}`, payload);
        showToast('Resume updated successfully.');
      } else {
        await apiClient.post('/jobs/resumes', payload);
        showToast('Resume created successfully.');
      }
      setEditorMode(false);
      fetchResumes();
    } catch (err) {
      showToast('Failed to save resume.', 'error');
    }
  };

  // Sections custom re-ordering (Move Up / Down)
  const handleMoveUp = (list, setList, idx) => {
    if (idx === 0) return;
    const newList = [...list];
    const temp = newList[idx];
    newList[idx] = newList[idx - 1];
    newList[idx - 1] = temp;
    setList(newList);
  };

  const handleMoveDown = (list, setList, idx) => {
    if (idx === list.length - 1) return;
    const newList = [...list];
    const temp = newList[idx];
    newList[idx] = newList[idx + 1];
    newList[idx + 1] = temp;
    setList(newList);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    setProjects(prev => [...prev, projForm]);
    setProjForm({ title: '', role: '', description: '', link: '' });
    setProjectModalOpen(false);
  };

  const handleAddCustomSection = (e) => {
    e.preventDefault();
    setCustomSections(prev => [...prev, customForm]);
    setCustomForm({ header: '', body: '' });
    setCustomModalOpen(false);
  };

  const getTemplateStyles = () => {
    switch (templateName) {
      case 'modern':
        return {
          fontFamily: "'Poppins', sans-serif",
          color: '#1E293B',
          container: { padding: '32px', borderTop: '8px solid var(--primary)', backgroundColor: '#FFFFFF', minHeight: '600px', overflowY: 'auto', maxHeight: '75vh', color: '#1E293B', fontFamily: "'Poppins', sans-serif" },
          header: { borderBottom: '2px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' },
          title: { color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 800, margin: 0 },
          sectionTitle: { color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '10px', marginTop: '16px' }
        };
      case 'professional':
        return {
          fontFamily: "Georgia, serif",
          color: '#0F172A',
          container: { padding: '32px', borderLeft: '6px solid var(--secondary)', backgroundColor: '#FFFFFF', minHeight: '600px', overflowY: 'auto', maxHeight: '75vh', color: '#0F172A', fontFamily: 'Georgia, serif' },
          header: { paddingBottom: '12px', marginBottom: '16px', borderBottom: '1px solid #E2E8F0' },
          title: { fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 },
          sectionTitle: { color: 'var(--secondary)', fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid var(--secondary)', paddingBottom: '4px', marginTop: '16px', marginBottom: '10px' }
        };
      case 'ats':
        return {
          fontFamily: "Arial, sans-serif",
          color: '#000000',
          container: { padding: '32px', backgroundColor: '#FFFFFF', minHeight: '600px', overflowY: 'auto', maxHeight: '75vh', color: '#000000', fontFamily: 'Arial, sans-serif' },
          header: { borderBottom: '1px solid #000000', paddingBottom: '10px', marginBottom: '16px' },
          title: { fontSize: '1.4rem', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 },
          sectionTitle: { fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '2px', marginTop: '14px', marginBottom: '6px' }
        };
      case 'classic':
      default:
        return {
          fontFamily: "'Times New Roman', Times, serif",
          color: '#111827',
          container: { padding: '32px', backgroundColor: '#FFFFFF', minHeight: '600px', overflowY: 'auto', maxHeight: '75vh', color: '#111827', fontFamily: "'Times New Roman', Times, serif" },
          header: { textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '10px', marginBottom: '16px' },
          title: { fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 },
          sectionTitle: { fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #111827', paddingBottom: '2px', marginTop: '16px', marginBottom: '10px' }
        };
    }
  };

  const previewStyle = getTemplateStyles();

  if (loading && !editorMode) {
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
        
        {!editorMode ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Resume Builder</h2>
                <p style={{ color: 'var(--text-muted)' }}>Build and manage custom resume versions tailored to different job applications.</p>
              </div>
              <Button variant="primary" onClick={handleCreateNew}>+ Create Resume</Button>
            </div>

            {resumes.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: '60px 24px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '24px' }}>
                  No resume profiles created yet. Click the button below to pre-populate details from your profile.
                </p>
                <Button variant="primary" onClick={handleCreateNew}>Build First Resume</Button>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {resumes.map((resume, idx) => (
                  <Card key={idx} style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '2rem' }}>📄</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontWeight: 700 }}>{resume.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>
                          Template: {resume.template_name}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                      Updated: {new Date(resume.updated_at).toLocaleDateString()}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <Button variant="outline" onClick={() => handleEdit(resume)} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>
                        Edit
                      </Button>
                      <Button variant="secondary" onClick={() => navigate(`/student/resumes/${resume.id}/preview`)} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>
                        Preview & PDF
                      </Button>
                      <Button variant="text" onClick={() => handleDelete(resume.id)} style={{ color: 'var(--error)', padding: '8px' }}>
                        &times;
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Editor Actions bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {currentResumeId ? 'Edit Resume' : 'Create New Resume'}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Customize templates, summary, and projects fields below. (Auto-saves every 5s of typing silence)</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="outline" onClick={() => setEditorMode(false)}>Exit</Button>
                <Button variant="primary" onClick={handleSaveResume}>Save & Exit</Button>
              </div>
            </div>

            {/* Split Screen: Editor on Left, Live Preview on Right! */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
              
              {/* Left Column: Form Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Card>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Template settings</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input label="Resume Document Title" id="resTitle" value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} required />
                    <div className="input-group">
                      <label className="input-label">Template Design</label>
                      <select
                        id="template"
                        className="input-field"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        style={{ appearance: 'auto' }}
                      >
                        <option value="classic">Classic Corporate</option>
                        <option value="modern">Modern Accent</option>
                        <option value="professional">Professional Serif</option>
                        <option value="ats">ATS Friendly</option>
                      </select>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Professional Summary</h3>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <textarea
                      id="summary"
                      className="input-field"
                      rows="4"
                      placeholder="Write summary..."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      style={{ resize: 'none' }}
                    ></textarea>
                  </div>
                </Card>

                {/* Skills configuration */}
                <Card>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Skills</h3>
                  <Input label="Skill Keywords (Comma-separated)" id="skills" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="e.g. React, NodeJS, Express" />
                </Card>

                {/* Reorderable Work Experience */}
                <Card>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Work Experience</h3>
                  {experiences.length === 0 ? <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>None</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {experiences.map((exp, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                          <div>
                            <strong>{exp.role}</strong> at <span>{exp.company}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="text" onClick={() => handleMoveUp(experiences, setExperiences, idx)} style={{ padding: 0 }}>▲</Button>
                            <Button variant="text" onClick={() => handleMoveDown(experiences, setExperiences, idx)} style={{ padding: 0 }}>▼</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Projects Section */}
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Projects</h3>
                    <Button variant="outline" onClick={() => setProjectModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      + Add Project
                    </Button>
                  </div>
                  {projects.length === 0 ? <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>None</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {projects.map((proj, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                          <div>
                            <strong>{proj.title}</strong>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="text" onClick={() => handleMoveUp(projects, setProjects, idx)} style={{ padding: 0 }}>▲</Button>
                            <Button variant="text" onClick={() => handleMoveDown(projects, setProjects, idx)} style={{ padding: 0 }}>▼</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Custom Sections */}
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Custom Sections</h3>
                    <Button variant="outline" onClick={() => setCustomModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      + Add Section
                    </Button>
                  </div>
                  {customSections.length === 0 ? <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>None</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {customSections.map((sec, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                          <div>
                            <strong>{sec.header}</strong>
                          </div>
                          <Button variant="text" onClick={() => setCustomSections(prev => prev.filter((_, i) => i !== idx))} style={{ color: 'var(--error)', padding: 0 }}>&times;</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Column: Live Preview Canvas */}
              <div style={{ position: 'sticky', top: '100px' }}>
                <Card style={{
                  ...previewStyle.container,
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div style={previewStyle.header}>
                    <h3 style={previewStyle.title}>Candidate Preview</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Live template design: {templateName}</span>
                  </div>

                  {summary && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={previewStyle.sectionTitle}>Summary</h4>
                      <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', margin: 0 }}>{summary}</p>
                    </div>
                  )}

                  {skillsText && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={previewStyle.sectionTitle}>Skills</h4>
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>{skillsText}</p>
                    </div>
                  )}

                  {experiences.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={previewStyle.sectionTitle}>Experience</h4>
                      {experiences.map((e, idx) => (
                        <div key={idx} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>{e.role} at {e.company}</span>
                            <span style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#64748B' }}>{e.start} - {e.end}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={previewStyle.sectionTitle}>Projects</h4>
                      {projects.map((p, idx) => (
                        <div key={idx} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 'bold' }}>{p.title} ({p.role})</div>
                          <p style={{ margin: '2px 0 0 0', color: '#475569' }}>{p.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {customSections.length > 0 && (
                    <div>
                      {customSections.map((sec, idx) => (
                        <div key={idx} style={{ marginBottom: '16px' }}>
                          <h4 style={previewStyle.sectionTitle}>{sec.header}</h4>
                          <p style={{ fontSize: '0.85rem', margin: 0, whiteSpace: 'pre-line' }}>{sec.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <Modal isOpen={projectModalOpen} onClose={() => setProjectModalOpen(false)} title="Add Custom Project">
        <form onSubmit={handleAddProject}>
          <Input label="Project Title" id="projTitle" value={projForm.title} onChange={(e) => setProjForm({ ...projForm, title: e.target.value })} required />
          <Input label="Your Role/Contribution" id="projRole" placeholder="e.g. Lead Frontend Developer" value={projForm.role} onChange={(e) => setProjForm({ ...projForm, role: e.target.value })} required />
          <div className="input-group">
            <label className="input-label">Project Description</label>
            <textarea
              id="projDesc"
              className="input-field"
              rows="3"
              placeholder="Detail your accomplishments..."
              value={projForm.description}
              onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
              style={{ resize: 'none' }}
              required
            ></textarea>
          </div>
          <Input label="Project Link URL (Optional)" id="projLink" type="url" placeholder="https://github.com/my-project" value={projForm.link} onChange={(e) => setProjForm({ ...projForm, link: e.target.value })} />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="outline" onClick={() => setProjectModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Project</Button>
          </div>
        </form>
      </Modal>

      {/* Add Custom Section Modal */}
      <Modal isOpen={customModalOpen} onClose={() => setCustomModalOpen(false)} title="Add Custom Section">
        <form onSubmit={handleAddCustomSection}>
          <Input label="Section Header Title" id="customHead" placeholder="e.g. Publications, Volunteer Work" value={customForm.header} onChange={(e) => setCustomForm({ ...customForm, header: e.target.value })} required />
          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label className="input-label">Section Content Text</label>
            <textarea
              id="customBody"
              className="input-field"
              rows="5"
              placeholder="Write section body details..."
              value={customForm.body}
              onChange={(e) => setCustomForm({ ...customForm, body: e.target.value })}
              style={{ resize: 'none' }}
              required
            ></textarea>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setCustomModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Section</Button>
          </div>
        </form>
      </Modal>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </StudentLayout>
  );
};

export default ResumeBuilder;
