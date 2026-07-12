import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import '../styles/pages.css';

const SignupPage = () => {
  const [role, setRole] = useState('student'); // 'student' or 'employer'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    contactPerson: '', // UI element
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  
  const { registerStudent, registerEmployer } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Common validations
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoadingState(true);

    try {
      if (role === 'student') {
        const studentPayload = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        };
        await registerStudent(studentPayload);
      } else {
        const employerPayload = {
          company_name: formData.companyName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        };
        await registerEmployer(employerPayload);
      }

      setSuccessMsg('Registration successful! Please check your email inbox to verify your account.');
      // Auto redirect to verify-email after 3 seconds
      setTimeout(() => {
        navigate('/verify-email');
      }, 3000);

    } catch (err) {
      setErrorMsg(err);
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ maxWidth: '540px' }}>
        <div className="auth-header">
          <Link to="/" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', display: 'inline-block' }}>
            💼 CareerPortal
          </Link>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Choose your user profile role to start registering</p>
        </div>

        {/* Dynamic Role Tab Buttons */}
        <div className="signup-role-selector">
          <button
            type="button"
            className={`role-tab-btn ${role === 'student' ? 'role-tab-btn-active' : ''}`}
            onClick={() => setRole('student')}
          >
            Student Candidate
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'employer' ? 'role-tab-btn-active' : ''}`}
            onClick={() => setRole('employer')}
          >
            Employer Recruiter
          </button>
        </div>

        <form onSubmit={handleSignupSubmit} className="auth-form-grid">
          {role === 'student' ? (
            <>
              <Input
                label="First Name"
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Last Name"
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </>
          ) : (
            <>
              <Input
                label="Company Name"
                id="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="auth-form-full"
                required
              />
              <Input
                label="Contact Person Name"
                id="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="auth-form-full"
                placeholder="e.g. HR Manager"
              />
            </>
          )}

          <Input
            label={role === 'student' ? 'Email Address' : 'Company Email'}
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="auth-form-full"
            placeholder={role === 'student' ? 'john.doe@email.com' : 'recruiting@company.com'}
            required
          />

          <Input
            label="Phone Number"
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="auth-form-full"
            placeholder="e.g. +91 98765 43210"
          />

          <Input
            label="Password"
            id="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
          />

          <div className="auth-form-full" style={{ marginTop: '16px' }}>
            <Button type="submit" variant="primary" fullWidth loading={loadingState}>
              Create Account
            </Button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="toast-container">
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
        </div>
      )}

      {successMsg && (
        <div className="toast-container">
          <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />
        </div>
      )}
    </div>
  );
};

export default SignupPage;
