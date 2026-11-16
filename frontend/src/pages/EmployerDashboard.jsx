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
  CartesianGrid,
  Legend
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

  const offerRateList = (stats?.charts?.offerAcceptanceRate || []).map(d => ({
    name: d.name,
    value: Number(d.value) || 0
  }));
  const acceptedCount = offerRateList.find(d => d.name === 'Accepted')?.value || 0;
  const pendingCount = offerRateList.find(d => d.name !== 'Accepted')?.value || 0;
  const totalOffersIssued = acceptedCount + pendingCount;
  const hasOfferRateData = totalOffersIssued > 0;
  const offerAcceptancePercent = hasOfferRateData ? Math.round((acceptedCount / totalOffersIssued) * 100) : null;

  return (
    <EmployerLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={{ marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Recruiter Telemetry Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Analyze applications, schedule interview pipelines, and track candidate evaluations.</p>
        </div>

        {/* Telemetry Metrics Cards - Exactly 3 Columns x 2 Rows */}
        <div className="recruiter-kpi-grid">
          {[
            { label: 'Total Jobs', val: stats?.totalJobs, icon: '💼', color: 'var(--primary)' },
            { label: 'Active Jobs', val: stats?.totalActiveJobs, icon: '⚡', color: '#10B981' },
            { label: 'Applications', val: stats?.totalApplications, icon: '👥', color: 'var(--secondary)' },
            { label: 'Shortlisted', val: stats?.totalShortlisted, icon: '✔', color: '#7C3AED' },
            { label: 'Interviews', val: stats?.totalInterviews, icon: '📅', color: '#3B82F6' },
            { label: 'Assessments', val: stats?.totalAssessments, icon: '📝', color: '#F59E0B' }
          ].map((card, i) => (
            <Card key={i} className="recruiter-kpi-card">
              <span className="recruiter-kpi-icon">{card.icon}</span>
              <span className="recruiter-kpi-label">{card.label}</span>
              <strong className="recruiter-kpi-val" style={{ color: card.color }}>
                {card.val ?? 0}
              </strong>
            </Card>
          ))}
        </div>

        {/* Analytics Section - Maximum 4 Charts Per Row */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
            📊 Recruitment & Pipeline Analytics
          </h3>
          <div className="dashboard-charts">
            
            {/* 1. Applications Per Position BarChart */}
            <Card className="chart-card">
              <div className="chart-card-header">
                <h4 className="chart-card-title">Applications Per Position</h4>
              </div>
              {(!stats?.charts?.applicationsPerJob || stats.charts.applicationsPerJob.length === 0) ? (
                <div className="chart-empty-state">No job applications recorded yet</div>
              ) : (
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.charts.applicationsPerJob} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="var(--text-muted)"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(val) => (val && val.length > 12 ? val.slice(0, 10) + '…' : (val || ''))}
                      />
                      <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* 2. Hiring Pipeline Distribution AreaChart */}
            <Card className="chart-card">
              <div className="chart-card-header">
                <h4 className="chart-card-title">Hiring Pipeline Distribution</h4>
              </div>
              {(!stats?.charts?.hiringPipeline || stats.charts.hiringPipeline.length === 0) ? (
                <div className="chart-empty-state">No pipeline candidates recorded yet</div>
              ) : (
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.charts.hiringPipeline} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRecruiterPipeline" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="var(--text-muted)"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(val) => val ? val.charAt(0).toUpperCase() + val.slice(1).replace('_', ' ') : ''}
                      />
                      <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="var(--secondary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRecruiterPipeline)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* 3. Job Postings Status Donut */}
            <Card className="chart-card">
              <div className="chart-card-header">
                <h4 className="chart-card-title">Postings Status</h4>
              </div>
              {(!stats?.charts?.jobStatus || stats.charts.jobStatus.length === 0 || stats.charts.jobStatus.every(d => Number(d.value) === 0)) ? (
                <div className="chart-empty-state">No job postings recorded yet</div>
              ) : (
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.charts.jobStatus.map(d => ({ ...d, value: Number(d.value) || 0 }))}
                        cx="50%"
                        cy="42%"
                        innerRadius={38}
                        outerRadius={58}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.charts.jobStatus.map((_, index) => (
                          <Cell key={`status-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* 4. Offer Acceptance Rate Donut */}
            <Card className="chart-card">
              <div className="chart-card-header">
                <h4 className="chart-card-title">
                  Offer Acceptance Rate
                  {offerAcceptancePercent !== null && (
                    <span style={{ marginLeft: '8px', fontSize: '0.9rem', color: '#10B981', fontWeight: 800 }}>
                      {offerAcceptancePercent}%
                    </span>
                  )}
                </h4>
              </div>
              {!hasOfferRateData ? (
                <div className="chart-empty-state">No offer letters issued yet</div>
              ) : (
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={offerRateList}
                        cx="50%"
                        cy="42%"
                        innerRadius={38}
                        outerRadius={58}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="rgba(245, 158, 11, 0.55)" />
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

          </div>
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
