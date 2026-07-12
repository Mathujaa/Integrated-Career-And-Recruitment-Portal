import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const navigate = useNavigate();

  // Dynamic greetings based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "The only way to do great work is to love what you do. — Steve Jobs",
      "Opportunity does not knock, it presents itself when you beat down the door. — Kyle Chandler",
      "Your career is like a garden. It can hold an assortment of life. — Professional Coach",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill"
    ];
    const day = new Date().getDate();
    return quotes[day % quotes.length];
  };

  useEffect(() => {
    fetchStatsAndProfile();
  }, []);

  const fetchStatsAndProfile = async () => {
    try {
      const [statsRes, profileRes, appsRes] = await Promise.all([
        apiClient.get('/student/dashboard-stats'),
        apiClient.get('/student/profile'),
        apiClient.get('/jobs/applications')
      ]);
      setStats(statsRes.data.stats);
      setProfile(profileRes.data.profile);
      setApplications(appsRes.data.applications || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard telemetry stats.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferResponse = async (offerId, responseStatus) => {
    try {
      await apiClient.post('/student/offers/respond', { offerId, status: responseStatus });
      setToastMsg(`Offer successfully ${responseStatus}!`);
      fetchStatsAndProfile();
    } catch (err) {
      console.error(err);
      setError('Failed to update offer placement status.');
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

  // Formatting chart datasets for Recharts
  const weeklyApplicationsData = (stats?.charts?.weeklyApplications || [1, 2, 0, 3, 1, 0, 2]).map((val, idx) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return { name: days[idx], applications: val };
  });

  const monthlyApplicationsData = (stats?.charts?.monthlyApplications || [4, 8, 12, 10, 6, 8]).map((val, idx) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return { name: months[idx], applications: val };
  });

  const resumeScoreTrendData = (stats?.charts?.resumeScoreTrend || [60, 72, 78, 84]).map((val, idx) => {
    return { name: `Rev ${idx + 1}`, score: val };
  });

  const latestApplication = stats?.recentApplications?.length > 0 ? stats.recentApplications[0] : null;
  const upcomingAssessment = stats?.widgets?.upcomingAssessments?.length > 0 ? stats.widgets.upcomingAssessments[0] : null;

  return (
    <StudentLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Top welcome banner */}
        <Card style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          color: '#FFFFFF',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: 'none',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '10rem', opacity: 0.15 }}>💼</div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
              {getGreeting()}, {profile?.first_name || 'Student'} 👋
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '8px 0', color: '#FFFFFF' }}>
              Your Placement Dashboard
            </h2>
            <p style={{ fontSize: '1rem', fontStyle: 'italic', opacity: 0.85, margin: '8px 0 0 0', maxWidth: '600px', lineHeight: 1.6 }}>
              "{getMotivationalQuote()}"
            </p>
          </div>
        </Card>

        {/* Recruiter Actions integration logs */}
        {(() => {
          const shortlistedApp = applications.find(a => a.application_status === 'shortlisted');
          if (shortlistedApp) {
            return (
              <Card style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '2px solid #10B981', color: '#10B981', padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '2rem' }}>🎉</span>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 'bold' }}>Congratulations!</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#047857' }}>
                    You have been shortlisted for the <strong>{shortlistedApp.title}</strong> role!
                  </p>
                </div>
              </Card>
            );
          }
          return null;
        })()}

        {profile?.offers?.length > 0 && (
          <Card style={{ borderLeft: '4px solid #10B981', padding: '24px' }}>
            <h4 style={{ color: '#10B981', margin: '0 0 16px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>Active Job Placement Offers</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {profile.offers.map((off, i) => (
                <div key={i} style={{ borderBottom: i < profile.offers.length - 1 ? '1px solid var(--border-light)' : 'none', paddingBottom: '16px', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <strong>Role: {off.role} at {off.company_name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Extended: {new Date(off.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>Joining Date: {new Date(off.joining_date).toLocaleDateString()} | Salary Package: INR {off.salary_offered.toLocaleString()}</p>
                  <p style={{ margin: '12px 0', backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', whiteSpace: 'pre-line', fontFamily: 'monospace' }}>{off.offer_text}</p>
                  
                  {off.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button variant="primary" style={{ backgroundColor: '#10B981', border: 'none', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleOfferResponse(off.id, 'accepted')}>Accept Offer</Button>
                      <Button variant="outline" style={{ color: 'var(--error)', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleOfferResponse(off.id, 'rejected')}>Decline Offer</Button>
                    </div>
                  ) : (
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: off.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: off.status === 'accepted' ? '#10B981' : '#EF4444'
                    }}>
                      Offer {off.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {profile?.rejections?.length > 0 && (
          <Card style={{ borderLeft: '4px solid var(--error)', padding: '24px' }}>
            <h4 style={{ color: 'var(--error)', margin: '0 0 16px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>Application Rejection Advice</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {profile.rejections.map((rej, i) => (
                <div key={i} style={{ borderBottom: i < profile.rejections.length - 1 ? '1px solid var(--border-light)' : 'none', paddingBottom: '16px', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <strong>Position: {rej.job_title}</strong>
                  <p style={{ margin: '6px 0', color: 'var(--text-muted)' }}>Feedback Reason: <strong style={{ color: 'var(--text-main)' }}>{rej.reason}</strong></p>
                  <p style={{ margin: '4px 0', color: 'var(--text-light)' }}>💡 Suggestions: {rej.improvements}</p>
                  <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>📍 Recommended Steps: {rej.next_steps}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {profile?.projectReviews?.length > 0 && (
          <Card style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>Employer Project Evaluations</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {profile.projectReviews.map((rev, i) => (
                <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '6px' }}>
                    <span>{rev.project_title}</span>
                    <span style={{ color: 'var(--secondary)' }}>⭐ {rev.rating}/5 | {rev.status.toUpperCase()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Comments: "{rev.comments}"</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions Panel */}
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={() => navigate('/student/resumes')} style={{ fontSize: '0.85rem' }}>📝 Build Resume</Button>
            <Button variant="outline" onClick={() => navigate('/student/jobs')} style={{ fontSize: '0.85rem' }}>🔍 Search Jobs</Button>
            <Button variant="outline" onClick={() => navigate('/student/assessments')} style={{ fontSize: '0.85rem' }}>📝 Take Assessment</Button>
            <Button variant="outline" onClick={() => navigate('/student/profile')} style={{ fontSize: '0.85rem' }}>👤 Update Profile</Button>
            <Button variant="primary" onClick={() => navigate('/student/ai-resume-review')} style={{ fontSize: '0.85rem' }}>🤖 AI Resume Review</Button>
          </div>
        </Card>

        {/* Highlight Section: Next Assessment, Latest App, Resume Score */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid var(--primary)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Next Assessment</span>
            {upcomingAssessment ? (
              <>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{upcomingAssessment.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 16px 0' }}>Deadline: {upcomingAssessment.deadline}</p>
                <Link to="/student/assessments" style={{ marginTop: 'auto' }}>
                  <Button variant="primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Take Test</Button>
                </Link>
              </>
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No pending assessments.</p>
            )}
          </Card>

          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid var(--success)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Latest Application</span>
            {latestApplication ? (
              <>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{latestApplication.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 16px 0' }}>
                  Status:{' '}
                  <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {latestApplication.application_status.replace('_', ' ')}
                  </span>
                </p>
                <Link to="/student/applications" style={{ marginTop: 'auto' }}>
                  <Button variant="outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>View Timeline</Button>
                </Link>
              </>
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No submitted applications.</p>
            )}
          </Card>

          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid var(--secondary)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>ATS Compatibility</span>
            <h4 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', margin: '4px 0 8px 0' }}>{stats?.atsScore || 0}%</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Overall compatibility rating matching default resumes.</p>
            <Link to="/student/ai-resume-review" style={{ marginTop: 'auto' }}>
              <Button variant="outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Scan Another Resume</Button>
            </Link>
          </Card>
        </div>

        {/* Statistics 8-Grid telemetry */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Quick Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Jobs Applied', val: stats?.totalApplications, icon: '💼', color: 'var(--primary)' },
              { label: 'Saved Jobs', val: stats?.totalSavedJobs, icon: '⭐', color: '#EAB308' },
              { label: 'Resume Score', val: `${stats?.resumeScore}%`, icon: '📄', color: 'var(--secondary)' },
              { label: 'Interviews', val: stats?.interviewsScheduled, icon: '📅', color: '#06B6D4' }
            ].map((card, i) => (
              <Card key={i} style={{
                padding: '20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer'
              }} className="quick-stat-hover-card">
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>{card.icon}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>{card.label}</span>
                <strong style={{ fontSize: '1.5rem', display: 'block', marginTop: '4px', color: card.color }}>{card.val}</strong>
              </Card>
            ))}
          </div>
        </div>

        {/* Recharts Analytics Section */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Placement Analytics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            
            {/* Weekly Applications Recharts Barchart */}
            <Card style={{ padding: '28px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Weekly Applications</h4>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyApplicationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(79, 70, 229, 0.04)' }} />
                    <Bar dataKey="applications" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Monthly Applications Recharts Filled Area Chart */}
            <Card style={{ padding: '28px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Application Funnel Trend</h4>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyApplicationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="applications" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Resume optimization line trend chart */}
            <Card style={{ padding: '28px', gridColumn: 'span 1' }} className="dashboard-span-full-opt">
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Resume Score Optimization</h4>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resumeScoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 6, strokeWidth: 2, fill: 'var(--bg-card)' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>
        </div>

        {/* Widgets Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          
          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Assessments Calendar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats?.widgets?.upcomingAssessments?.map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 700 }}>{a.title}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Deadline: {a.deadline}</span>
                  </div>
                  <Link to="/student/assessments">
                    <Button variant="outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Take Test</Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: '28px', backgroundColor: 'rgba(79, 70, 229, 0.01)', border: '1px dashed rgba(79, 70, 229, 0.2)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--primary)' }}>🤖 AI Career Advice</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats?.widgets?.aiTips?.map((tip, idx) => (
                <p key={idx} style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  💡 {tip}
                </p>
              ))}
            </div>
          </Card>
        </div>

      </div>
      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentDashboard;
