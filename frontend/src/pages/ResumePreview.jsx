import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const ResumePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchResumeAndProfile();
  }, [id]);

  const fetchResumeAndProfile = async () => {
    try {
      const [resResponse, profResponse] = await Promise.all([
        apiClient.get(`/jobs/resumes/${id}`),
        apiClient.get('/student/profile')
      ]);
      setResume(resResponse.data.resume);
      setProfile(profResponse.data.profile);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load resume details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (errorMsg || !resume) {
    return (
      <StudentLayout>
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--error)' }}>{errorMsg || 'Resume not found.'}</p>
          <Button variant="primary" onClick={() => navigate('/student/resumes')} style={{ marginTop: '20px' }}>
            Back to Resumes
          </Button>
        </Card>
      </StudentLayout>
    );
  }

  const rData = typeof resume.resume_data === 'string' ? JSON.parse(resume.resume_data) : resume.resume_data;

  // Determine Styling based on selected template
  const getTemplateStyles = () => {
    switch (resume.template_name) {
      case 'modern':
        return {
          fontFamily: "'Poppins', sans-serif",
          color: '#1E293B',
          container: { padding: '40px', borderTop: '8px solid var(--primary)', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' },
          header: { borderBottom: '2px solid #E2E8F0', paddingBottom: '20px', marginBottom: '24px' },
          title: { color: 'var(--primary)', fontSize: '2rem', fontWeight: 800, margin: 0 },
          sectionTitle: { color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginBottom: '12px', marginTop: '24px' }
        };
      case 'professional':
        return {
          fontFamily: "Georgia, serif",
          color: '#0F172A',
          container: { padding: '44px', borderLeft: '6px solid var(--secondary)', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' },
          header: { paddingBottom: '16px', marginBottom: '20px', borderBottom: '1px solid #E2E8F0' },
          title: { fontSize: '2.1rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 },
          sectionTitle: { color: 'var(--secondary)', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid var(--secondary)', paddingBottom: '4px', marginTop: '20px', marginBottom: '12px' }
        };
      case 'ats':
        return {
          fontFamily: "Arial, sans-serif",
          color: '#000000',
          container: { padding: '36px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' },
          header: { borderBottom: '1px solid #000000', paddingBottom: '12px', marginBottom: '20px' },
          title: { fontSize: '1.8rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' },
          sectionTitle: { fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '2px', marginTop: '18px', marginBottom: '8px' }
        };
      case 'classic':
      default:
        return {
          fontFamily: "'Times New Roman', Times, serif",
          color: '#111827',
          container: { padding: '48px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' },
          header: { textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '12px', marginBottom: '24px' },
          title: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 },
          sectionTitle: { fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #111827', paddingBottom: '2px', marginTop: '20px', marginBottom: '12px' }
        };
    }
  };

  const style = getTemplateStyles();

  return (
    <StudentLayout>
      {/* Print Helpers Overlay Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide Navbar, Footer, and Sidebar completely */
          nav, footer, aside, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
          }
          body {
            background-color: #FFFFFF !important;
            color: #000000 !important;
          }
          .resume-sheet {
            box-shadow: none !important;
            padding: 0 !important;
            border: none !important;
          }
        }
      `}} />

      <div className="fade-in">
        {/* Editor Actions bar (Hidden when printing) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Resume Preview</h2>
            <p style={{ color: 'var(--text-muted)' }}>Visualize layout and export as a clean PDF.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" onClick={() => navigate('/student/resumes')}>
              Back to Builder
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              Print / Download PDF
            </Button>
          </div>
        </div>

        {/* Printable Resume Canvas Sheet */}
        <div id="resume-print-area" className="resume-sheet" style={{
          ...style.container,
          fontFamily: style.fontFamily,
          color: style.color,
          maxWidth: '800px',
          margin: '0 auto',
          minHeight: '1000px',
          lineHeight: 1.6
        }}>
          {/* Header */}
          <div style={style.header}>
            <h1 style={style.title}>
              {profile?.first_name} {profile?.last_name}
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.9rem', color: '#64748B', flexWrap: 'wrap', marginTop: '6px' }}>
              <span>✉ {profile?.email || 'email@address.com'}</span>
              {profile?.phone && <span>📞 {profile.phone}</span>}
              {profile?.portfolio_url && <span>💻 {profile.portfolio_url}</span>}
            </div>
            <p style={{ fontStyle: 'italic', marginTop: '10px', fontSize: '1.05rem', color: '#475569' }}>
              {profile?.headline}
            </p>
          </div>

          {/* Professional Summary */}
          {rData.summary && (
            <div>
              <h3 style={style.sectionTitle}>Professional Summary</h3>
              <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{rData.summary}</p>
            </div>
          )}

          {/* Experience */}
          {rData.experiences && rData.experiences.length > 0 && (
            <div>
              <h3 style={style.sectionTitle}>Work Experience</h3>
              {rData.experiences.map((exp, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    <span>{exp.role} at {exp.company}</span>
                    <span style={{ fontWeight: 'normal', color: '#64748B', fontSize: '0.85rem' }}>{exp.start} — {exp.end || 'Present'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {rData.educations && rData.educations.length > 0 && (
            <div>
              <h3 style={style.sectionTitle}>Education</h3>
              {rData.educations.map((edu, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    <span>{edu.degree} in {edu.field}</span>
                    <span style={{ fontWeight: 'normal', color: '#64748B', fontSize: '0.85rem' }}>{edu.start} — {edu.end || 'Present'}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#475569' }}>{edu.school}</div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {rData.projects && rData.projects.length > 0 && (
            <div>
              <h3 style={style.sectionTitle}>Projects</h3>
              {rData.projects.map((proj, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    <span>{proj.title} <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '0.9rem' }}>({proj.role})</span></span>
                    {proj.link && <a href={proj.link} target="_blank" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'underline' }}>Link</a>}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#475569', margin: '4px 0 0 0' }}>{proj.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {rData.skills && (
            <div>
              <h3 style={style.sectionTitle}>Skills</h3>
              <p style={{ fontSize: '0.95rem', letterSpacing: '0.2px' }}>{rData.skills}</p>
            </div>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="toast-container no-print">
          <Toast message={toastMsg} type="error" onClose={() => setErrorMsg('')} />
        </div>
      )}
    </StudentLayout>
  );
};

export default ResumePreview;
