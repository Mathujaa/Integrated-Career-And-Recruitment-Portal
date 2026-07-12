import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployerLayout from '../components/EmployerLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import Input from '../components/Input';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const EmployerApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Modals controllers
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectAppId, setRejectAppId] = useState(null);
  const [rejectionForm, setRejectionForm] = useState({
    reason: 'Experience mismatch',
    improvements: 'Focus on expanding project portfolios with robust CRUD pipelines.',
    next_steps: 'Revise core framework features and re-apply in 3 months.'
  });

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    student_id: '',
    job_id: jobId,
    date: '',
    time: '',
    mode: 'online',
    location_link: 'https://meet.google.com/abc-defg-hij',
    notes: 'Technical evaluation round focused on React Hooks and SQL queries.'
  });

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    student_id: '',
    job_id: jobId,
    role: 'Software Engineer',
    salary_offered: '800000',
    joining_date: '',
    offer_text: 'We are pleased to offer you the position of Software Engineer...'
  });

  const feedbackReasons = [
    'Insufficient React knowledge',
    'Resume lacked project details',
    'Assessment score below cutoff',
    'Experience mismatch',
    'Communication needs improvement',
    'Custom feedback'
  ];

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const response = await apiClient.get(`/employer/jobs/${jobId}/applicants`);
      setApplicants(response.data.applicants);
    } catch (err) {
      console.error(err);
      showToast('Failed to load applicants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleShortlist = async (appId) => {
    try {
      await apiClient.put(`/employer/applications/${appId}/status`, { status: 'shortlisted' });
      showToast('Applicant shortlisted! Student dashboard updated.');
      fetchApplicants();
    } catch (err) {
      showToast('Failed to shortlist applicant.', 'error');
    }
  };

  const handleOpenReject = (appId) => {
    setRejectAppId(appId);
    setRejectionForm({
      reason: 'Experience mismatch',
      improvements: 'Focus on expanding project portfolios with robust CRUD pipelines.',
      next_steps: 'Revise core framework features and re-apply in 3 months.'
    });
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/employer/applications/${rejectAppId}/status`, {
        status: 'rejected',
        feedback: rejectionForm
      });
      showToast('Applicant rejected. Feedback has been sent.');
      setRejectModalOpen(false);
      fetchApplicants();
    } catch (err) {
      showToast('Failed to reject candidate.', 'error');
    }
  };

  const handleOpenInterview = (studentId) => {
    setInterviewForm({
      student_id: studentId,
      job_id: jobId,
      date: new Date().toISOString().substring(0, 10),
      time: '14:00',
      mode: 'online',
      location_link: 'https://meet.google.com/abc-defg-hij',
      notes: 'Technical evaluation round focused on React Hooks and SQL queries.'
    });
    setInterviewModalOpen(true);
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/employer/interviews', interviewForm);
      showToast('Interview session scheduled successfully!');
      setInterviewModalOpen(false);
    } catch (err) {
      showToast('Failed to schedule interview.', 'error');
    }
  };

  const handleOpenOffer = (studentId) => {
    setOfferForm({
      student_id: studentId,
      job_id: jobId,
      role: 'Associate Software Engineer',
      salary_offered: '800000',
      joining_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      offer_text: 'TechCorp Solutions is pleased to extend you an offer for the Associate Software Engineer role. Your annual CTC will be INR 8,00,000. Welcome aboard!'
    });
    setOfferModalOpen(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/employer/offers', offerForm);
      showToast('Official offer sheet extended successfully!');
      setOfferModalOpen(false);
    } catch (err) {
      showToast('Failed to generate offer letter.', 'error');
    }
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setProfileModalOpen(true);
  };

  if (loading) {
    return (
      <EmployerLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Spinner size="lg" />
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="fade-in">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Applicants Pipeline</h2>
            <p style={{ color: 'var(--text-muted)' }}>Review credentials, shortlist high-matches, schedule coding screens, or issue offers.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/employer/jobs')}>Back to Postings</Button>
        </div>

        {applicants.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '12px' }}>
              No candidates have applied for this position yet.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {applicants.map((app, idx) => (
              <Card key={idx} style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                  
                  {/* Left Side Info */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--secondary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.25rem'
                      }}>
                        {app.first_name[0]}{app.last_name[0]}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{app.first_name} {app.last_name}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.headline || 'Software Engineer Candidate'}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                      <span>🏫 CGPA Score: <strong>{app.cgpa}</strong></span>
                      <span>✉ Email: {app.email || 'student@recruitment.com'}</span>
                      {app.phone && <span>📞 Contact: {app.phone}</span>}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', fontStyle: 'italic' }}>
                      " {app.cover_letter || 'No cover letter attached.'} "
                    </p>
                  </div>

                  {/* Overlay Compatibilities Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', minWidth: '180px' }}>
                    <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', width: '100%' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>ATS Match Score</span>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{app.atsScore}% Match</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: app.application_status === 'shortlisted' ? 'rgba(16, 185, 129, 0.1)' : app.application_status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: app.application_status === 'shortlisted' ? '#10B981' : app.application_status === 'rejected' ? '#EF4444' : '#F59E0B',
                        textTransform: 'uppercase'
                      }}>
                        {app.application_status}
                      </span>
                    </div>
                  </div>

                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <Button variant="outline" onClick={() => handleViewProfile(app)}>View Profile</Button>
                  
                  {app.application_status === 'applied' && (
                    <>
                      <Button variant="primary" onClick={() => handleShortlist(app.application_id)}>Shortlist</Button>
                      <Button variant="outline" onClick={() => handleOpenReject(app.application_id)} style={{ color: 'var(--error)' }}>Reject</Button>
                    </>
                  )}

                  {app.application_status === 'shortlisted' && (
                    <>
                      <Button variant="secondary" onClick={() => handleOpenInterview(app.student_id)}>Schedule Interview</Button>
                      <Button variant="primary" onClick={() => handleOpenOffer(app.student_id)} style={{ backgroundColor: '#10B981', border: 'none' }}>Extend Offer</Button>
                      <Button variant="outline" onClick={() => handleOpenReject(app.application_id)} style={{ color: 'var(--error)' }}>Reject</Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Applicant Feedback Details">
        <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Primary Rejection Reason</label>
            <select
              className="input-field"
              value={rejectionForm.reason}
              onChange={(e) => setRejectionForm({ ...rejectionForm, reason: e.target.value })}
              style={{ appearance: 'auto' }}
            >
              {feedbackReasons.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Suggested Improvements</label>
            <textarea
              className="input-field"
              rows="3"
              value={rejectionForm.improvements}
              onChange={(e) => setRejectionForm({ ...rejectionForm, improvements: e.target.value })}
              required
            ></textarea>
          </div>
          <div className="input-group">
            <label className="input-label">Recommended Next Steps</label>
            <textarea
              className="input-field"
              rows="2"
              value={rejectionForm.next_steps}
              onChange={(e) => setRejectionForm({ ...rejectionForm, next_steps: e.target.value })}
              required
            ></textarea>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" style={{ backgroundColor: 'var(--error)', border: 'none' }}>Confirm Rejection</Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal isOpen={interviewModalOpen} onClose={() => setInterviewModalOpen(false)} title="Schedule Technical Assessment Interview">
        <form onSubmit={handleInterviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Meeting Date" type="date" id="intDate" value={interviewForm.date} onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })} required />
            <Input label="Time Slot" type="time" id="intTime" value={interviewForm.time} onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })} required />
          </div>
          <div className="input-group">
            <label className="input-label">Meeting Mode</label>
            <select className="input-field" value={interviewForm.mode} onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })} style={{ appearance: 'auto' }}>
              <option value="online">Online Meeting</option>
              <option value="offline">In-Person Interview</option>
            </select>
          </div>
          <Input label="Meeting Link / Location Room" id="intLink" value={interviewForm.location_link} onChange={(e) => setInterviewForm({ ...interviewForm, location_link: e.target.value })} required />
          <div className="input-group">
            <label className="input-label">Instructions / Notes</label>
            <textarea
              className="input-field"
              rows="3"
              value={interviewForm.notes}
              onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
            ></textarea>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="outline" onClick={() => setInterviewModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Schedule Session</Button>
          </div>
        </form>
      </Modal>

      {/* Offer Letter Modal */}
      <Modal isOpen={offerModalOpen} onClose={() => setOfferModalOpen(false)} title="Issue Offer Letter Placement Sheet">
        <form onSubmit={handleOfferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Extended Job Title Role" id="offRole" value={offerForm.role} onChange={(e) => setOfferForm({ ...offerForm, role: e.target.value })} required />
          <Input label="Salary Offered (INR Per Annum)" type="number" id="offSal" value={offerForm.salary_offered} onChange={(e) => setOfferForm({ ...offerForm, salary_offered: e.target.value })} required />
          <Input label="Proposed Joining Date" type="date" id="offJoin" value={offerForm.joining_date} onChange={(e) => setOfferForm({ ...offerForm, joining_date: e.target.value })} required />
          <div className="input-group">
            <label className="input-label">Offer Terms & Document Body</label>
            <textarea
              className="input-field"
              rows="5"
              value={offerForm.offer_text}
              onChange={(e) => setOfferForm({ ...offerForm, offer_text: e.target.value })}
              required
            ></textarea>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="outline" onClick={() => setOfferModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" style={{ backgroundColor: '#10B981', border: 'none' }}>Extend Placement Offer</Button>
          </div>
        </form>
      </Modal>

      {/* View Student Profile Detail Modal */}
      <Modal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} title="Candidate Credentials Portfolio">
        {selectedStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>{selectedStudent.first_name} {selectedStudent.last_name}</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{selectedStudent.headline || 'Software Engineer Candidate'}</p>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <h5 style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: '8px' }}>Portfolio Links</h5>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {selectedStudent.github_url && <a href={selectedStudent.github_url} target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Github Profile</a>}
                {selectedStudent.linkedin_url && <a href={selectedStudent.linkedin_url} target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>LinkedIn Profile</a>}
                {selectedStudent.portfolio_url && <a href={selectedStudent.portfolio_url} target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Portfolio Site</a>}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <h5 style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: '8px' }}>Skills & Stack</h5>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedStudent.skills?.map((s, i) => (
                  <span key={i} style={{ padding: '4px 10px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {s.name} ({s.proficiency_level || 'Intermediate'})
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <h5 style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: '8px' }}>Projects</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedStudent.projects?.map((p, i) => (
                  <div key={i} style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <strong>{p.title}</strong> ({p.role})
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.description}</p>
                    {p.link && <a href={p.link} target="_blank" style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.8rem', color: 'var(--primary)' }}>Project Link</a>}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="outline" onClick={() => setProfileModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </EmployerLayout>
  );
};

export default EmployerApplicants;
