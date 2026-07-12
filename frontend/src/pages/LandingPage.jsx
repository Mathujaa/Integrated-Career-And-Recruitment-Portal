import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import '../styles/pages.css';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: '🤖',
      title: 'AI Resume Analyzer',
      description: 'Receive real-time ATS compatibility reviews and customized keyword recommendations to elevate your profile.'
    },
    {
      icon: '📅',
      title: 'Interactive Calendars',
      description: 'Seamless interview scheduling with integrated email alerts, meeting links, and calendar bookings.'
    },
    {
      icon: '📊',
      title: 'Hiring Funnel Analytics',
      description: 'Detailed analytics dashboards for recruiters to track applicants counts, interview funnel rates, and active jobs.'
    }
  ];

  const testimonials = [
    {
      quote: 'CareerPortal revolutionized our recruitment workflow. We filled three critical engineering posts in under two weeks.',
      author: 'Jane McMiller',
      role: 'Head of Recruiting at TechLabs'
    },
    {
      quote: 'The AI feedback on my resume helped me understand exactly which keywords were missing. I got an interview in days!',
      author: 'David Chen',
      role: 'Software Engineer Graduate'
    }
  ];

  const faqs = [
    {
      question: 'How does the email verification process protect accounts?',
      answer: 'Upon sign-up, a single-use verification token is cryptographically generated and sent to your mailbox. Activating this token updates your database status and verifies your identity.'
    },
    {
      question: 'Can I change my profile role from student to employer?',
      answer: 'No, to enforce structural database integrity, roles are determined at registration. You can create separate accounts with different emails if you perform multiple duties.'
    },
    {
      question: 'Is my resume data secure?',
      answer: 'Yes. All candidate profiles, resume payloads, and uploads are protected by secure JWT tokens and role guards. We restrict unauthorized database queries to ensure data privacy.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero fade-in">
        <div className="container landing-hero-content">
          <div>
            <span className="hero-badge">Milestone 2 Launch</span>
            <h1 className="hero-title">Discover Your Next Career Opportunity</h1>
            <p className="hero-subtitle">
              An integrated recruitment platform mapping elite student talent to corporate recruiters, enriched with automated scheduling, custom resumes, and dashboard funnels.
            </p>
            <div className="hero-actions">
              <Link to="/signup">
                <Button variant="primary">Create Free Account</Button>
              </Link>
              <a href="#features">
                <Button variant="outline">Explore Features</Button>
              </a>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="illustration-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '2rem' }}>🎓</span>
                <div>
                  <h4 style={{ margin: 0 }}>Student Analytics</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Active Funnel Profile</p>
                </div>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--border-light)', borderRadius: '4px', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: '78%', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Resume Match: 78%</span>
                <span style={{ marginLeft: 'auto' }}>Status: Approved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-section landing-section-bg">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Enriched Recruitment Infrastructure</h2>
            <p>Experience clean dashboard interfaces built specifically for student candidates, corporate employers, and portal administrators.</p>
          </div>
          <div className="features-grid">
            {features.map((feature, i) => (
              <Card key={i} className="feature-card">
                <div className="feature-icon-box">{feature.icon}</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: '0.95rem' }}>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Trusted by Tech Teams</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {testimonials.map((t, i) => (
              <Card key={i} style={{ padding: '32px', borderLeft: '4px solid var(--primary)' }}>
                <p style={{ fontSize: '1.05rem', fontStyle: 'italic', marginBottom: '20px', color: 'var(--text-main)' }}>
                  "{t.quote}"
                </p>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{t.author}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="landing-section landing-section-bg">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Support</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-question" onClick={() => toggleFaq(i)}>
                  <span>{faq.question}</span>
                  <span>{activeFaq === i ? '−' : '+'}</span>
                </button>
                {activeFaq === i && (
                  <div className="faq-answer fade-in">
                    <p style={{ margin: 0 }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
