import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Advanced Filters
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [company, setCompany] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'salary', 'match'

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (filterParams = {}) => {
    setLoading(true);
    try {
      const response = await apiClient.get('/jobs', { params: filterParams });
      let list = response.data.jobs;

      // Apply sorting on list
      if (sortBy === 'salary') {
        list = [...list].sort((a, b) => parseFloat(b.salary_max || 0) - parseFloat(a.salary_max || 0));
      } else if (sortBy === 'match') {
        list = [...list].sort((a, b) => (b.aiMatch?.matchPercent || 0) - (a.aiMatch?.matchPercent || 0));
      }

      setJobs(list);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (keyword) params.keyword = keyword;
    if (location) params.location = location;
    if (employmentType) params.employment_type = employmentType;
    if (workMode) params.work_mode = workMode;
    fetchJobs(params);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setEmploymentType('');
    setWorkMode('');
    setMinSalary('');
    setCompany('');
    fetchJobs();
  };

  const handleToggleSave = async (jobId, isCurrentlySaved, index) => {
    try {
      if (isCurrentlySaved) {
        await apiClient.delete(`/jobs/details/${jobId}/unsave`);
        showToast('Job bookmark removed.');
      } else {
        await apiClient.post(`/jobs/details/${jobId}/save`);
        showToast('Job bookmarked successfully.');
      }
      setJobs(prevJobs => prevJobs.map((job, idx) => {
        if (idx === index) {
          return { ...job, isSaved: !isCurrentlySaved };
        }
        return job;
      }));
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  return (
    <StudentLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Search Placements & Jobs</h2>
            <p style={{ color: 'var(--text-muted)' }}>Scan and apply to active positions mapped dynamically to your profile skills.</p>
          </div>
          
          {/* Sorting controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 600 }}>Sort By:</span>
            <select
              className="input-field"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                // Trigger re-sort on current list
                const list = [...jobs];
                if (e.target.value === 'salary') {
                  list.sort((a, b) => parseFloat(b.salary_max || 0) - parseFloat(a.salary_max || 0));
                } else if (e.target.value === 'match') {
                  list.sort((a, b) => (b.aiMatch?.matchPercent || 0) - (a.aiMatch?.matchPercent || 0));
                } else {
                  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                }
                setJobs(list);
              }}
              style={{ appearance: 'auto', margin: 0, padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <option value="newest">Newest Postings</option>
              <option value="salary">Highest Salary</option>
              <option value="match">Best AI Match %</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <Card style={{ marginBottom: '32px', padding: '30px' }}>
          <form onSubmit={handleSearchSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <Input label="Keywords / Skills" id="keyword" placeholder="e.g. React, Python" value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ marginBottom: 0 }} />
              <Input label="Location" id="location" placeholder="e.g. Remote, Mumbai" value={location} onChange={(e) => setLocation(e.target.value)} style={{ marginBottom: 0 }} />
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Job Type</label>
                <select className="input-field" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="">All Types</option>
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Work Mode</label>
                <select className="input-field" value={workMode} onChange={(e) => setWorkMode(e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="">All Modes</option>
                  <option value="on-site">On-Site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <Button type="button" variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
              <Button type="submit" variant="primary">Search Positions</Button>
            </div>
          </form>
        </Card>

        {/* Listings Result */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spinner size="md" />
          </div>
        ) : jobs.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <p>No job listings matched your filter settings.</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {jobs.map((job, idx) => (
              <Card key={idx} style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                      <Link to={`/student/jobs/${job.id}`} style={{ color: 'var(--text-main)' }}>
                        {job.title}
                      </Link>
                    </h3>
                    
                    {/* Matching rate badge */}
                    {job.aiMatch?.matchPercent > 0 && (
                      <span style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        color: 'var(--success)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '12px'
                      }} title={`Why suits: ${job.aiMatch.whySuits}`}>
                        🎯 {job.aiMatch.matchPercent}% Match
                      </span>
                    )}

                    <span style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                      {job.work_mode}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '12px' }}>
                    Corporate Recruiter • {job.location} • <span style={{ textTransform: 'capitalize' }}>{job.employment_type}</span>
                  </p>

                  {/* Matching skills preview snippet */}
                  {job.aiMatch?.matchedSkills?.length > 0 && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <strong>Matches:</strong> {job.aiMatch.matchedSkills.slice(0,3).join(', ')}
                    </p>
                  )}
                  
                  {job.salary_min && (
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>
                      ₹{parseFloat(job.salary_min).toLocaleString()} - ₹{parseFloat(job.salary_max).toLocaleString()} / year
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Button variant="outline" onClick={() => handleToggleSave(job.id, job.isSaved, idx)} style={{ padding: '12px' }}>
                    {job.isSaved ? '★' : '☆'}
                  </Button>
                  
                  <Link to={`/student/jobs/${job.id}`}>
                    <Button variant="primary">View Details</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </StudentLayout>
  );
};

export default JobSearch;
