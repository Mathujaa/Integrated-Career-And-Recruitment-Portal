import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import '../styles/pages.css';

const CompleteProfilePage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('info');
  const navigate = useNavigate();

  const [studentFields, setStudentFields] = useState({
    dateOfBirth: '',
    headline: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: ''
  });

  const [employerFields, setEmployerFields] = useState({
    companyWebsite: '',
    companyIndustry: '',
    companySize: '1-10',
    companyDescription: '',
    contactPhone: ''
  });

  const handleStudentChange = (e) => {
    const { id, value } = e.target;
    setStudentFields(prev => ({ ...prev, [id]: value }));
  };

  const handleEmployerChange = (e) => {
    const { id, value } = e.target;
    setEmployerFields(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToastType('success');
      setToastMsg('Profile details successfully updated!');
      setTimeout(() => {
        navigate(`/${user?.role || 'student'}/dashboard`);
      }, 2000);
    }, 1500);
  };

  if (!user) {
    return (
      <div className="auth-container">
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <p>Please log in to complete your profile setup.</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <Card style={{ padding: '40px' }}>
            <div className="auth-header">
              <h2 className="auth-title">Complete Your Profile</h2>
              <p className="auth-subtitle">Help us customize your dashboard experience by sharing more info</p>
            </div>

            {/* Stepper Indicators */}
            <div className="profile-steps-container">
              <div className={`profile-step-dot ${step >= 1 ? 'profile-step-dot-active' : ''}`}>1</div>
              <div style={{ flex: 1, height: '2px', backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--border-light)', alignSelf: 'center', margin: '0 8px' }}></div>
              <div className={`profile-step-dot ${step >= 2 ? 'profile-step-dot-active' : ''}`}>2</div>
              <div style={{ flex: 1, height: '2px', backgroundColor: step >= 3 ? 'var(--primary)' : 'var(--border-light)', alignSelf: 'center', margin: '0 8px' }}></div>
              <div className={`profile-step-dot ${step >= 3 ? 'profile-step-dot-active' : ''}`}>3</div>
            </div>

            <form onSubmit={handleSubmit}>
              {user.role === 'student' ? (
                <>
                  {step === 1 && (
                    <div className="fade-in">
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Step 1: Professional Summary</h3>
                      <Input
                        label="Headline"
                        id="headline"
                        placeholder="e.g. Computer Science Undergraduate at XYZ University"
                        value={studentFields.headline}
                        onChange={handleStudentChange}
                        required
                      />
                      <div className="input-group">
                        <label className="input-label">Bio</label>
                        <textarea
                          id="bio"
                          className="input-field"
                          rows="4"
                          placeholder="Tell us about yourself..."
                          value={studentFields.bio}
                          onChange={handleStudentChange}
                          style={{ resize: 'none' }}
                        ></textarea>
                      </div>
                      <Button variant="primary" fullWidth onClick={() => setStep(2)}>Next Step</Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="fade-in">
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Step 2: Social Portfolios</h3>
                      <Input
                        label="LinkedIn Profile URL"
                        id="linkedinUrl"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={studentFields.linkedinUrl}
                        onChange={handleStudentChange}
                      />
                      <Input
                        label="GitHub Profile URL"
                        id="githubUrl"
                        type="url"
                        placeholder="https://github.com/username"
                        value={studentFields.githubUrl}
                        onChange={handleStudentChange}
                      />
                      <Input
                        label="Portfolio Website URL"
                        id="portfolioUrl"
                        type="url"
                        placeholder="https://myportfolio.com"
                        value={studentFields.portfolioUrl}
                        onChange={handleStudentChange}
                      />
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Button variant="outline" fullWidth onClick={() => setStep(1)}>Back</Button>
                        <Button variant="primary" fullWidth onClick={() => setStep(3)}>Next Step</Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Step 3: Account Verification Details</h3>
                      <Input
                        label="Date of Birth"
                        id="dateOfBirth"
                        type="date"
                        value={studentFields.dateOfBirth}
                        onChange={handleStudentChange}
                        required
                      />
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                        Almost finished! Verify your dates and click finalize to complete your Candidate registration.
                      </p>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Button variant="outline" fullWidth onClick={() => setStep(2)} disabled={loading}>Back</Button>
                        <Button type="submit" variant="primary" fullWidth loading={loading}>Finalize Setup</Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {step === 1 && (
                    <div className="fade-in">
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Step 1: Corporate Details</h3>
                      <Input
                        label="Company Website"
                        id="companyWebsite"
                        type="url"
                        placeholder="https://mycompany.com"
                        value={employerFields.companyWebsite}
                        onChange={handleEmployerChange}
                        required
                      />
                      <Input
                        label="Contact Phone"
                        id="contactPhone"
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={employerFields.contactPhone}
                        onChange={handleEmployerChange}
                        required
                      />
                      <Button variant="primary" fullWidth onClick={() => setStep(2)}>Next Step</Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="fade-in">
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Step 2: Company Size & Industry</h3>
                      <div className="input-group">
                        <label className="input-label">Company Size</label>
                        <select
                          id="companySize"
                          className="input-field"
                          value={employerFields.companySize}
                          onChange={handleEmployerChange}
                          style={{ appearance: 'auto' }}
                        >
                          <option value="1-10">1 - 10 employees</option>
                          <option value="11-50">11 - 50 employees</option>
                          <option value="51-200">51 - 200 employees</option>
                          <option value="201-500">201 - 500 employees</option>
                          <option value="501-1000">501 - 1000 employees</option>
                          <option value="1000+">1000+ employees</option>
                        </select>
                      </div>
                      <Input
                        label="Industry Category"
                        id="companyIndustry"
                        placeholder="e.g. Information Technology, FinTech"
                        value={employerFields.companyIndustry}
                        onChange={handleEmployerChange}
                        required
                      />
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Button variant="outline" fullWidth onClick={() => setStep(1)}>Back</Button>
                        <Button variant="primary" fullWidth onClick={() => setStep(3)}>Next Step</Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="fade-in">
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Step 3: Company Summary</h3>
                      <div className="input-group" style={{ marginBottom: '32px' }}>
                        <label className="input-label">Company Description</label>
                        <textarea
                          id="companyDescription"
                          className="input-field"
                          rows="5"
                          placeholder="Briefly describe your company mission..."
                          value={employerFields.companyDescription}
                          onChange={handleEmployerChange}
                          style={{ resize: 'none' }}
                        ></textarea>
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Button variant="outline" fullWidth onClick={() => setStep(2)} disabled={loading}>Back</Button>
                        <Button type="submit" variant="primary" fullWidth loading={loading}>Finalize Setup</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </form>
          </Card>
        </div>
      </div>
      <Footer />

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </div>
  );
};

export default CompleteProfilePage;
