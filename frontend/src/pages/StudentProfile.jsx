import React, { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Basic Info state
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicForm, setBasicForm] = useState({});

  // Modals controllers
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [projModalOpen, setProjModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [achModalOpen, setAchModalOpen] = useState(false);

  // Form states (stores items being added or edited)
  const [selectedEdu, setSelectedEdu] = useState(null); // if not null, we are editing
  const [eduForm, setEduForm] = useState({ institution_name: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade_gpa: '', description: '' });

  const [selectedExp, setSelectedExp] = useState(null);
  const [expForm, setExpForm] = useState({ company_name: '', job_title: '', location: '', start_date: '', end_date: '', is_current: false, description: '' });

  const [selectedProj, setSelectedProj] = useState(null);
  const [projForm, setProjForm] = useState({ title: '', role: '', description: '', link: '' });

  const [selectedCert, setSelectedCert] = useState(null);
  const [certForm, setCertForm] = useState({ certification_name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '' });

  const [skillForm, setSkillForm] = useState({ name: '', proficiency_level: 'intermediate' });
  const [langForm, setLangForm] = useState({ name: '', proficiency: 'professional' });
  
  const [selectedAch, setSelectedAch] = useState(null);
  const [achForm, setAchForm] = useState({ title: '', description: '', date_earned: '' });

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/student/profile');
      setProfile(response.data.profile);
      setBasicForm(response.data.profile);
    } catch (err) {
      console.error(err);
      showToast('Failed to load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put('/student/profile', basicForm);
      showToast('Basic information updated.');
      setEditingBasic(false);
      fetchProfile();
    } catch (err) {
      showToast('Failed to update details.', 'error');
    }
  };

  // Education ADD/DELETE
  const handleAddEdu = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/student/education', eduForm);
      showToast('Education record added.');
      setEduModalOpen(false);
      setEduForm({ institution_name: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade_gpa: '', description: '' });
      fetchProfile();
    } catch (err) {
      showToast('Failed to add education.', 'error');
    }
  };

  const handleDeleteEdu = async (id) => {
    try {
      await apiClient.delete(`/student/education/${id}`);
      showToast('Education record deleted.');
      fetchProfile();
    } catch (err) {
      showToast('Failed to remove education.', 'error');
    }
  };

  // Experience ADD/DELETE
  const handleAddExp = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/student/experience', expForm);
      showToast('Experience record added.');
      setExpModalOpen(false);
      setExpForm({ company_name: '', job_title: '', location: '', start_date: '', end_date: '', is_current: false, description: '' });
      fetchProfile();
    } catch (err) {
      showToast('Failed to add experience.', 'error');
    }
  };

  const handleDeleteExp = async (id) => {
    try {
      await apiClient.delete(`/student/experience/${id}`);
      showToast('Experience record removed.');
      fetchProfile();
    } catch (err) {
      showToast('Failed to remove experience.', 'error');
    }
  };

  // Projects ADD/DELETE
  const handleAddProj = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/student/projects', projForm);
      showToast('Project details added.');
      setProjModalOpen(false);
      setProjForm({ title: '', role: '', description: '', link: '' });
      fetchProfile();
    } catch (err) {
      showToast('Failed to add project.', 'error');
    }
  };

  const handleDeleteProj = async (id) => {
    try {
      await apiClient.delete(`/student/projects/${id}`);
      showToast('Project removed.');
      fetchProfile();
    } catch (err) {
      showToast('Failed to remove project.', 'error');
    }
  };

  // Certifications ADD/DELETE
  const handleAddCert = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/student/certification', certForm);
      showToast('Certification added.');
      setCertModalOpen(false);
      setCertForm({ certification_name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '' });
      fetchProfile();
    } catch (err) {
      showToast('Failed to add certification.', 'error');
    }
  };

  const handleDeleteCert = async (id) => {
    try {
      await apiClient.delete(`/student/certification/${id}`);
      showToast('Certification removed.');
      fetchProfile();
    } catch (err) {
      showToast('Failed to remove certification.', 'error');
    }
  };

  // Skills ADD/DELETE
  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/student/skills', skillForm);
      showToast('Skill linked.');
      setSkillModalOpen(false);
      setSkillForm({ name: '', proficiency_level: 'intermediate' });
      fetchProfile();
    } catch (err) {
      showToast('Failed to link skill.', 'error');
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await apiClient.delete(`/student/skills/${id}`);
      showToast('Skill unlinked.');
      fetchProfile();
    } catch (err) {
      showToast('Failed to unlink skill.', 'error');
    }
  };

  // Languages ADD/DELETE
  const handleAddLang = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/student/languages', langForm);
      showToast('Language details linked.');
      setLangModalOpen(false);
      setLangForm({ name: '', proficiency: 'professional' });
      fetchProfile();
    } catch (err) {
      showToast('Failed to link language.', 'error');
    }
  };

  const handleDeleteLang = async (id) => {
    try {
      await apiClient.delete(`/student/languages/${id}`);
      showToast('Language unlinked.');
      fetchProfile();
    } catch (err) {
      showToast('Failed to unlink language.', 'error');
    }
  };

  // Achievements ADD/DELETE
  const handleAddAch = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/student/achievements', achForm);
      showToast('Achievement logged successfully.');
      setAchModalOpen(false);
      setAchForm({ title: '', description: '', date_earned: '' });
      fetchProfile();
    } catch (err) {
      showToast('Failed to log achievement.', 'error');
    }
  };

  const handleDeleteAch = async (id) => {
    try {
      await apiClient.delete(`/student/achievements/${id}`);
      showToast('Achievement record removed.');
      fetchProfile();
    } catch (err) {
      showToast('Failed to delete achievement.', 'error');
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
        
        {/* Header Basics Card */}
        <Card style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--primary)',
              fontSize: '3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed var(--primary)'
            }}>
              {profile?.first_name ? profile.first_name[0] : 'U'}
            </div>
            
            <div style={{ flex: 1 }}>
              {editingBasic ? (
                <form onSubmit={handleBasicSubmit} className="auth-form-grid" style={{ marginTop: '12px' }}>
                  <Input label="First Name" id="firstName" value={basicForm.first_name} onChange={(e) => setBasicForm({ ...basicForm, first_name: e.target.value })} required />
                  <Input label="Last Name" id="lastName" value={basicForm.last_name} onChange={(e) => setBasicForm({ ...basicForm, last_name: e.target.value })} required />
                  <Input label="Professional Headline" id="headline" value={basicForm.headline || ''} onChange={(e) => setBasicForm({ ...basicForm, headline: e.target.value })} className="auth-form-full" placeholder="e.g. Student at ABC University" />
                  <Input label="Contact Phone" id="phone" value={basicForm.phone || ''} onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })} />
                  <Input label="Date of Birth" id="dob" type="date" value={basicForm.date_of_birth ? basicForm.date_of_birth.substring(0,10) : ''} onChange={(e) => setBasicForm({ ...basicForm, date_of_birth: e.target.value })} />
                  <Input label="GitHub URL" id="github" type="url" value={basicForm.github_url || ''} onChange={(e) => setBasicForm({ ...basicForm, github_url: e.target.value })} />
                  <Input label="LinkedIn URL" id="linkedin" type="url" value={basicForm.linkedin_url || ''} onChange={(e) => setBasicForm({ ...basicForm, linkedin_url: e.target.value })} />
                  <Input label="Portfolio Website" id="portfolio" type="url" value={basicForm.portfolio_url || ''} onChange={(e) => setBasicForm({ ...basicForm, portfolio_url: e.target.value })} className="auth-form-full" />
                  
                  <div className="auth-form-full" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <Button variant="outline" onClick={() => setEditingBasic(false)}>Cancel</Button>
                    <Button type="submit" variant="primary">Save Changes</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <Button variant="outline" onClick={() => setEditingBasic(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      Edit Basics
                    </Button>
                  </div>
                  <p style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {profile?.headline || 'Add a professional headline to describe your field.'}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" className="auth-link">LinkedIn 🔗</a>}
                    {profile?.github_url && <a href={profile.github_url} target="_blank" className="auth-link">GitHub 🐙</a>}
                    {profile?.portfolio_url && <a href={profile.portfolio_url} target="_blank" className="auth-link">Portfolio 💻</a>}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Bio Panel */}
        {!editingBasic && (
          <Card>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>About Me</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {profile?.bio || 'Add a bio to introduce yourself.'}
            </p>
          </Card>
        )}

        {/* 1. Education History */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Education</h3>
            <Button variant="outline" onClick={() => setEduModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add Education
            </Button>
          </div>
          {profile?.educations.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>No education records added.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {profile.educations.map((edu, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: idx < profile.educations.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{edu.institution_name}</h4>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{edu.degree} in {edu.field_of_study}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      {new Date(edu.start_date).toLocaleDateString()} — {edu.end_date ? new Date(edu.end_date).toLocaleDateString() : 'Present'}
                    </p>
                    {edu.grade_gpa && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GPA: {edu.grade_gpa}</p>}
                  </div>
                  <Button variant="text" onClick={() => handleDeleteEdu(edu.id)} style={{ color: 'var(--error)' }}>Delete</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 2. Work Experience */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Work Experience</h3>
            <Button variant="outline" onClick={() => setExpModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add Experience
            </Button>
          </div>
          {profile?.experiences.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>No experience records added.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {profile.experiences.map((exp, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: idx < profile.experiences.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{exp.job_title}</h4>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{exp.company_name} — {exp.location}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      {new Date(exp.start_date).toLocaleDateString()} — {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <Button variant="text" onClick={() => handleDeleteExp(exp.id)} style={{ color: 'var(--error)' }}>Delete</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 3. Projects (V2 Upgraded) */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Projects</h3>
            <Button variant="outline" onClick={() => setProjModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add Project
            </Button>
          </div>
          {profile?.projects?.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>No projects logged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {profile.projects.map((proj, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: idx < profile.projects.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{proj.title} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({proj.role})</span></h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '4px 0' }}>{proj.description}</p>
                    {proj.link && <a href={proj.link} target="_blank" className="auth-link" style={{ fontSize: '0.85rem' }}>Project Link 🔗</a>}
                  </div>
                  <Button variant="text" onClick={() => handleDeleteProj(proj.id)} style={{ color: 'var(--error)' }}>Delete</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 4. Certifications */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Certifications</h3>
            <Button variant="outline" onClick={() => setCertModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add Certification
            </Button>
          </div>
          {profile?.certifications.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>No certifications logged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {profile.certifications.map((cert, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: idx < profile.certifications.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{cert.certification_name}</h4>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{cert.issuing_organization}</p>
                  </div>
                  <Button variant="text" onClick={() => handleDeleteCert(cert.id)} style={{ color: 'var(--error)' }}>Delete</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 5. Skills Tags */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Skills</h3>
            <Button variant="outline" onClick={() => setSkillModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add Skill
            </Button>
          </div>
          {profile?.skills.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>No skills linked.</p>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {profile.skills.map((skill, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}>
                  <span>{skill.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>({skill.proficiency_level})</span>
                  <button onClick={() => handleDeleteSkill(skill.id)} style={{ color: 'var(--error)', fontWeight: 'bold', fontSize: '1rem', marginLeft: '4px' }}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 6. Languages (V2 Upgraded) */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Languages</h3>
            <Button variant="outline" onClick={() => setLangModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add Language
            </Button>
          </div>
          {profile?.languages?.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>No languages linked.</p>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {profile.languages.map((lang, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}>
                  <span>{lang.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>({lang.proficiency})</span>
                  <button onClick={() => handleDeleteLang(lang.id)} style={{ color: 'var(--error)', fontWeight: 'bold', fontSize: '1rem', marginLeft: '4px' }}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 7. Achievements (V2 Upgraded) */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Achievements</h3>
            <Button variant="outline" onClick={() => setAchModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add Achievement
            </Button>
          </div>
          {profile?.achievements?.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>No achievements recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {profile.achievements.map((ach, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: idx < profile.achievements.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{ach.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '4px 0' }}>{ach.description}</p>
                    {ach.date_earned && <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Date: {new Date(ach.date_earned).toLocaleDateString()}</p>}
                  </div>
                  <Button variant="text" onClick={() => handleDeleteAch(ach.id)} style={{ color: 'var(--error)' }}>Delete</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>

      {/* Add Education Modal */}
      <Modal isOpen={eduModalOpen} onClose={() => setEduModalOpen(false)} title="Add Education Record">
        <form onSubmit={handleAddEdu}>
          <Input label="School Name" id="instName" value={eduForm.institution_name} onChange={(e) => setEduForm({ ...eduForm, institution_name: e.target.value })} required />
          <Input label="Degree Type" id="deg" placeholder="e.g. Bachelor of Science" value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} required />
          <Input label="Field of Study" id="field" placeholder="e.g. Computer Science" value={eduForm.field_of_study} onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Start Date" id="startDate" type="date" value={eduForm.start_date} onChange={(e) => setEduForm({ ...eduForm, start_date: e.target.value })} required />
            <Input label="End Date" id="endDate" type="date" value={eduForm.end_date} onChange={(e) => setEduForm({ ...eduForm, end_date: e.target.value })} />
          </div>
          <Input label="Grade/GPA" id="gpa" placeholder="e.g. 3.8/4.0" value={eduForm.grade_gpa} onChange={(e) => setEduForm({ ...eduForm, grade_gpa: e.target.value })} />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="outline" onClick={() => setEduModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Record</Button>
          </div>
        </form>
      </Modal>

      {/* Add Experience Modal */}
      <Modal isOpen={expModalOpen} onClose={() => setExpModalOpen(false)} title="Add Experience Record">
        <form onSubmit={handleAddExp}>
          <Input label="Company Name" id="compName" value={expForm.company_name} onChange={(e) => setExpForm({ ...expForm, company_name: e.target.value })} required />
          <Input label="Job Title" id="title" value={expForm.job_title} onChange={(e) => setExpForm({ ...expForm, job_title: e.target.value })} required />
          <Input label="Location" id="loc" placeholder="e.g. Remote, India" value={expForm.location} onChange={(e) => setExpForm({ ...expForm, location: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Start Date" id="start" type="date" value={expForm.start_date} onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })} required />
            <Input label="End Date" id="end" type="date" value={expForm.end_date} onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })} disabled={expForm.is_current} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0 20px 0' }}>
            <input type="checkbox" id="current" checked={expForm.is_current} onChange={(e) => setExpForm({ ...expForm, is_current: e.target.checked })} />
            <label htmlFor="current" style={{ fontSize: '0.9rem', fontWeight: 500 }}>I am currently working in this role</label>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setExpModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Record</Button>
          </div>
        </form>
      </Modal>

      {/* Add Project Modal */}
      <Modal isOpen={projModalOpen} onClose={() => setProjModalOpen(false)} title="Add Project Record">
        <form onSubmit={handleAddProj}>
          <Input label="Project Title" id="projTitle" value={projForm.title} onChange={(e) => setProjForm({ ...projForm, title: e.target.value })} required />
          <Input label="Your Role/Contribution" id="projRole" placeholder="e.g. Lead Developer" value={projForm.role} onChange={(e) => setProjForm({ ...projForm, role: e.target.value })} required />
          <div className="input-group">
            <label className="input-label">Project Description</label>
            <textarea
              id="projDesc"
              className="input-field"
              rows="3"
              placeholder="Detail your projects accomplishments..."
              value={projForm.description}
              onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
              style={{ resize: 'none' }}
            ></textarea>
          </div>
          <Input label="Project Link URL" id="projLink" type="url" placeholder="https://github.com/project" value={projForm.link} onChange={(e) => setProjForm({ ...projForm, link: e.target.value })} />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="outline" onClick={() => setProjModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Project</Button>
          </div>
        </form>
      </Modal>

      {/* Add Certification Modal */}
      <Modal isOpen={certModalOpen} onClose={() => setCertModalOpen(false)} title="Add Certification Record">
        <form onSubmit={handleAddCert}>
          <Input label="Certification Name" id="certName" value={certForm.certification_name} onChange={(e) => setCertForm({ ...certForm, certification_name: e.target.value })} required />
          <Input label="Issuing Organization" id="issuer" value={certForm.issuing_organization} onChange={(e) => setCertForm({ ...certForm, issuing_organization: e.target.value })} required />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="outline" onClick={() => setCertModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Record</Button>
          </div>
        </form>
      </Modal>

      {/* Add Skill Modal */}
      <Modal isOpen={skillModalOpen} onClose={() => setSkillModalOpen(false)} title="Link Skill Tag">
        <form onSubmit={handleAddSkill}>
          <Input label="Skill Name" id="skillName" placeholder="e.g. React, Node.js" value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} required />
          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label className="input-label">Proficiency Level</label>
            <select
              id="proficiency"
              className="input-field"
              value={skillForm.proficiency_level}
              onChange={(e) => setSkillForm({ ...skillForm, proficiency_level: e.target.value })}
              style={{ appearance: 'auto' }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setSkillModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Link Skill</Button>
          </div>
        </form>
      </Modal>

      {/* Add Language Modal */}
      <Modal isOpen={langModalOpen} onClose={() => setLangModalOpen(false)} title="Link Language Tag">
        <form onSubmit={handleAddLang}>
          <Input label="Language Name" id="langName" placeholder="e.g. English, French" value={langForm.name} onChange={(e) => setLangForm({ ...langForm, name: e.target.value })} required />
          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label className="input-label">Proficiency Level</label>
            <select
              id="langProf"
              className="input-field"
              value={langForm.proficiency}
              onChange={(e) => setLangForm({ ...langForm, proficiency: e.target.value })}
              style={{ appearance: 'auto' }}
            >
              <option value="elementary">Elementary</option>
              <option value="limited">Limited Working</option>
              <option value="professional">Professional Working</option>
              <option value="full">Full Professional</option>
              <option value="native">Native / Bilingual</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setLangModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Link Language</Button>
          </div>
        </form>
      </Modal>

      {/* Add Achievement Modal */}
      <Modal isOpen={achModalOpen} onClose={() => setAchModalOpen(false)} title="Log Achievement">
        <form onSubmit={handleAddAch}>
          <Input label="Achievement Title" id="achTitle" placeholder="e.g. Hackathon Winner" value={achForm.title} onChange={(e) => setAchForm({ ...achForm, title: e.target.value })} required />
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              id="achDesc"
              className="input-field"
              rows="3"
              placeholder="State your accomplishments..."
              value={achForm.description}
              onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
              style={{ resize: 'none' }}
            ></textarea>
          </div>
          <Input label="Date Earned" id="achDate" type="date" value={achForm.date_earned} onChange={(e) => setAchForm({ ...achForm, date_earned: e.target.value })} />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="outline" onClick={() => setAchModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Log Achievement</Button>
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

export default StudentProfile;
