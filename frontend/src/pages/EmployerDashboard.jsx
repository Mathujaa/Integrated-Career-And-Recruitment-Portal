import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import EmployerLayout from '../components/EmployerLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const EmployerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#4F46E5', '#7C3AED', '#3B82F6', '#10B981', '#EF4444', '#F59E0B'];

  useEffect(() => {
    fetchStatsAndRankings();
  }, []);

  const fetchStatsAndRankings = async () => {
    try {
      const [statsRes, rankingsRes] = await Promise.all([
        apiClient.get('/employer/dashboard-stats'),
        apiClient.get('/employer/rankings')
      ]);
      setStats(statsRes.data.stats);
      setRankings(rankingsRes.data.rankings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankingBadge = (level) => {
    switch (level) {
      case 'gold': return { icon: '🥇', label: 'Gold Tier', color: '#FBBC05' };
      case 'silver': return { icon: '🥈', label: 'Silver Tier', color: '#94A3B8' };
      case 'bronze': return { icon: '🥉', label: 'Bronze Tier', color: '#B45309' };
      default:
        return null;
    }
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
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={{ marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Recruiter Telemetry Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Analyze applications, schedule interview pipelines, and track candidate evaluations.</p>
        </div>

        {/* Telemetry Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          {[
            { label: 'Total Jobs', val: stats?.totalJobs, icon: '💼', color: 'var(--primary)' },
            { label: 'Active Jobs', val: stats?.totalActiveJobs, icon: '⚡', color: '#10B981' },
            { label: 'Applications', val: stats?.totalApplications, icon: '👥', color: 'var(--secondary)' },
            { label: 'Shortlisted', val: stats?.totalShortlisted, icon: '✔', color: '#7C3AED' },
            { label: 'Interviews', val: stats?.totalInterviews, icon: '📅', color: '#3B82F6' },
            { label: 'Assessments', val: stats?.totalAssessments, icon: '📝', color: '#F59E0B' }
          ].map((card, i) => (
            <Card key={i} style={{ padding: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>{card.icon}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>{card.label}</span>
              <strong style={{ fontSize: '1.6rem', display: 'block', marginTop: '4px', color: card.color }}>{card.val}</strong>
            </Card>
          ))}
        </div>

        {/* Recharts Analytics Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          
          {/* Applications Per Job BarChart */}
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Applications Per Position</h4>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.charts?.applicationsPerJob || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Hiring Pipeline Funnel AreaChart */}
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Hiring pipeline Distribution</h4>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.charts?.hiringPipeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="var(--secondary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPipeline)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Job Status PieChart */}
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Postings Status</h4>
            <div style={{ width: '100%', height: 220, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="80%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.charts?.jobStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.charts?.jobStatus || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Assessment Completion BarChart */}
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Assessment Completions</h4>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.charts?.assessmentCompletions || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Offer Acceptance Rate PieChart */}
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Offer Acceptance Rate</h4>
            <div style={{ width: '100%', height: 220, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="80%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.charts?.offerAcceptanceRate || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.charts?.offerAcceptanceRate || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Candidate Leaderboard rankings grid */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Top Placement Candidates Leaderboard</h3>
          <Card style={{ padding: '24px' }}>
            {rankings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>No rankings evaluated yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                      <th style={{ padding: '12px 16px' }}>Rank</th>
                      <th style={{ padding: '12px 16px' }}>Name</th>
                      <th style={{ padding: '12px 16px' }}>Headline</th>
                      <th style={{ padding: '12px 16px' }}>Rank Tier</th>
                      <th style={{ padding: '12px 16px' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((cand, idx) => {
                      const badge = getRankingBadge(cand.level);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>#{idx + 1}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-main)', fontWeight: 600 }}>{cand.name}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{cand.headline || 'Software Engineer Candidate'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {badge && (
                              <span style={{
                                color: badge.color,
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}>
                                {badge.icon} {badge.label}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--secondary)' }}>{cand.total_points} pts</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

      </div>
    </EmployerLayout>
  );
};

export default EmployerDashboard;
