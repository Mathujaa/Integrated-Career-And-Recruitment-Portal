import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0F172A',
      color: '#94A3B8',
      padding: '64px 0 32px 0',
      borderTop: '1px solid #1E293B',
      fontSize: '0.9rem'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        marginBottom: '48px'
      }}>
        <div>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>💼 CareerPortal</h3>
          <p style={{ color: '#64748B', lineHeight: 1.6 }}>
            Connecting dynamic talents with top recruiters. Streamlining job searches and matching profiles with state-of-the-art evaluations.
          </p>
        </div>
        <div>
          <h4 style={{ color: '#FFFFFF', fontWeight: 600, marginBottom: '16px' }}>For Candidates</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/signup" style={{ color: '#94A3B8' }}>Create Profile</Link></li>
            <li><Link to="/login" style={{ color: '#94A3B8' }}>Search Jobs</Link></li>
            <li><Link to="/login" style={{ color: '#94A3B8' }}>AI Resume Review</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#FFFFFF', fontWeight: 600, marginBottom: '16px' }}>For Employers</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/signup" style={{ color: '#94A3B8' }}>Post Jobs</Link></li>
            <li><Link to="/login" style={{ color: '#94A3B8' }}>Candidate Ranking</Link></li>
            <li><Link to="/login" style={{ color: '#94A3B8' }}>Interview Manager</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#FFFFFF', fontWeight: 600, marginBottom: '16px' }}>Support</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/" style={{ color: '#94A3B8' }}>FAQs</Link></li>
            <li><Link to="/" style={{ color: '#94A3B8' }}>Privacy Policy</Link></li>
            <li><Link to="/" style={{ color: '#94A3B8' }}>Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container" style={{
        borderTop: '1px solid #1E293B',
        paddingTop: '24px',
        textAlign: 'center',
        color: '#64748B'
      }}>
        <p>&copy; {new Date().getFullYear()} Integrated Career & Recruitment Portal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
