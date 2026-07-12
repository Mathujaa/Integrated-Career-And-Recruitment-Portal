import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const COLORS = ['#4F46E5', '#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const StatCard = ({ icon, label, value, color }) => (
  <Card style={{ padding: '20px', textAlign: 'center' }}>
    <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '4px' }}>{icon}</span>
    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
    <strong style={{ fontSize: '1.6rem', display: 'block', marginTop: '4px', color: color || 'var(--primary)' }}>
      {value ?? '—'}
    </strong>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/dashboard-stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch administrative dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  const counts = stats?.counts || {};
  const charts = stats?.charts || {};

  const salaryData = [
    { name: 'Highest Package', value: charts.highestPackage ? +(charts.highestPackage / 100000).toFixed(2) : 0 },
    { name: 'Average Package', value: charts.averagePackage ? +(charts.averagePackage / 100000).toFixed(2) : 0 }
  ];

  // Offer acceptance donut data
  const offerDonut = [
    { name: 'Accepted', value: counts.offersAccepted || 0 },
    { name: 'Pending',  value: Math.max(0, (counts.offersSent || 0) - (counts.offersAccepted || 0)) }
  ];

  return (
    <AdminLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🛡 Administrative Control Panel</h2>
            <p style={{ color: 'var(--text-muted)' }}>Overview of student placements, recruiter pipelines, and system metrics.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Card style={{ padding: '12px 24px', backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Overall Placements</span>
              <strong style={{ fontSize: '1.8rem', display: 'block', color: 'var(--primary)', marginTop: '2px' }}>
                {counts.placementPercent ?? 0}%
              </strong>
            </Card>
            <Button variant="outline" onClick={fetchStats} style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="card" style={{ borderLeft: '4px solid var(--error)', padding: '16px', color: 'var(--error)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <Button variant="outline" onClick={fetchStats} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Retry</Button>
          </div>
        )}

        {/* Telemetry Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '20px' }}>
          <StatCard icon="🎓" label="Total Students"   value={counts.totalStudents}  color="var(--primary)" />
          <StatCard icon="🏢" label="Total Recruiters" value={counts.totalRecruiters} color="var(--secondary)" />
          <StatCard icon="💼" label="Active Jobs"       value={counts.activeJobs}      color="#10B981" />
          <StatCard icon="📋" label="Applications"     value={counts.applications}    color="#3B82F6" />
          <StatCard icon="✔"  label="Shortlisted"      value={counts.shortlisted}     color="#7C3AED" />
          <StatCard icon="📅" label="Interviews"        value={counts.interviews}      color="#F59E0B" />
          <StatCard icon="✉"  label="Offers Sent"       value={counts.offersSent}      color="#6366F1" />
          <StatCard icon="🤝" label="Offers Accepted"   value={counts.offersAccepted}  color="#10B981" />
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px' }}>

          {/* Monthly Applications Area Chart */}
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Applications Trend (Monthly)</h4>
            {(charts.applicationsPerMonth || []).length === 0 ? (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No application data yet</div>
            ) : (
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.applicationsPerMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAdminApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdminApps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Salary Package Bar Chart */}
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Salary Packages Offered (LPA)</h4>
            {salaryData.every(d => d.value === 0) ? (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No placement offers accepted yet</div>
            ) : (
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value) => `${value} LPA`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      <Cell fill="var(--secondary)" />
                      <Cell fill="var(--primary)" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Company-wise Placements Pie */}
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Company-wise Placements</h4>
            {(charts.companyPlacements || []).length === 0 ? (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No accepted offers yet</div>
            ) : (
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.companyPlacements} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {charts.companyPlacements.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Department-wise Placements Pie */}
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Department-wise Placements</h4>
            {(charts.departmentPlacements || []).length === 0 ? (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No department data available yet</div>
            ) : (
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.departmentPlacements} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {charts.departmentPlacements.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Offer Acceptance Rate Donut */}
          <Card style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>
              Offer Acceptance Rate
              <span style={{ marginLeft: '12px', fontSize: '1rem', color: '#10B981', fontWeight: 800 }}>
                {charts.offerAcceptRate ?? 0}%
              </span>
            </h4>
            {offerDonut.every(d => d.value === 0) ? (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No offers issued yet</div>
            ) : (
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={offerDonut} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                      <Cell fill="#10B981" />
                      <Cell fill="rgba(245, 158, 11, 0.5)" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
