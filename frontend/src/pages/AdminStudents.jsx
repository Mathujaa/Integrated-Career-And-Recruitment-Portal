import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const PAGE_LIMIT = 20;

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchStudents(); }, [page, statusFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: searchTerm, page, limit: PAGE_LIMIT });
      const res = await apiClient.get(`/admin/students?${params}`);
      setStudents(res.data.rows || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      showToast('Failed to load students list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleStatusToggle = async (studentId, currentStatus) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await apiClient.put(`/admin/students/${studentId}/status`, { status: nextStatus });
      showToast(`Student account ${nextStatus === 'active' ? 'activated' : 'suspended'} successfully.`);
      fetchStudents();
      if (selectedStudent?.profile?.id === studentId) handleViewDetails(studentId);
    } catch (err) {
      console.error(err);
      showToast('Failed to update student status.', 'error');
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this student account? This cannot be undone.')) return;
    try {
      await apiClient.delete(`/admin/students/${studentId}`);
      showToast('Student account deleted successfully.');
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete student account.', 'error');
    }
  };

  const handleViewDetails = async (studentId) => {
    setDetailsLoading(true);
    try {
      const res = await apiClient.get(`/admin/students/${studentId}`);
      setSelectedStudent(res.data.student);
    } catch (err) {
      console.error(err);
      showToast('Failed to load student details.', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Client-side status filter on top of server search
  const filtered = statusFilter === 'all'
    ? students
    : students.filter(s => s.status === statusFilter);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <AdminLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🎓 Students Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Audit student profiles, view project reviews, assessment attempts, and placement portfolios.</p>
        </div>

        {/* Filters */}
        <Card style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-main)', color: 'var(--text-main)',
                flex: 1, minWidth: '200px'
              }}
            />
            <Button type="submit" variant="outline" style={{ padding: '10px 18px' }}>Search</Button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 600
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </Card>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}><Spinner size="md" /></div>
        ) : (
          <div>
            <Card style={{ padding: '24px' }}>
              {filtered.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '24px 0' }}>
                  No matching student records found.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-light)' }}>
                        <th style={{ padding: '12px' }}>Name</th>
                        <th style={{ padding: '12px' }}>Email</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Phone</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(student => (
                        <tr key={student.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{student.first_name} {student.last_name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{student.email}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                              backgroundColor: student.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                              color: student.status === 'active' ? '#10B981' : '#EF4444'
                            }}>
                              {student.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-light)' }}>{student.phone || 'N/A'}</td>
                          <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <Button variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleViewDetails(student.id)}>
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              style={{
                                padding: '6px 12px', fontSize: '0.8rem',
                                color: student.status === 'suspended' ? '#10B981' : '#F59E0B',
                                borderColor: student.status === 'suspended' ? '#10B981' : '#F59E0B'
                              }}
                              onClick={() => handleStatusToggle(student.id, student.status)}
                            >
                              {student.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </Button>
                            <Button variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleDelete(student.id)}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                <Button variant="outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  ← Prev
                </Button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Page {page} of {totalPages} · {total} total students
                </span>
                <Button variant="outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next →
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Student Details Modal */}
        {selectedStudent && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px'
          }}>
            {detailsLoading ? (
              <Spinner size="lg" />
            ) : (
              <Card style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
                <button
                  onClick={() => setSelectedStudent(null)}
                  style={{ position: 'absolute', right: '24px', top: '24px', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)' }}
                >✕</button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem'
                  }}>
                    {selectedStudent.profile.first_name?.[0]}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedStudent.profile.first_name} {selectedStudent.profile.last_name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {selectedStudent.profile.email} · Status: <strong>{selectedStudent.profile.status}</strong>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                  {/* Academic */}
                  <div>
                    <h4 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '12px' }}>Academic Details</h4>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Headline:</strong> {selectedStudent.profile.headline || 'None'}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Phone:</strong> {selectedStudent.profile.phone || 'N/A'}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Skills:</strong> {selectedStudent.skills.map(s => s.name).join(', ') || 'None'}</p>

                    <h5 style={{ margin: '16px 0 8px 0' }}>Education</h5>
                    {selectedStudent.educations.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No education records.</p>
                    ) : selectedStudent.educations.map((edu, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '8px', padding: '10px', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}>
                        <strong>{edu.degree} in {edu.field_of_study}</strong>
                        <p style={{ margin: '2px 0', color: 'var(--text-muted)' }}>{edu.institution_name} (GPA: {edu.grade_gpa || 'N/A'})</p>
                      </div>
                    ))}

                    <h5 style={{ margin: '16px 0 8px 0' }}>Resumes ({selectedStudent.resumes?.length || 0})</h5>
                    {(selectedStudent.resumes || []).length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No resumes built.</p>
                    ) : selectedStudent.resumes.map((r, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem', padding: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', marginBottom: '6px' }}>
                        📄 {r.title || `Resume ${idx + 1}`}
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(r.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Projects & Assessments */}
                  <div>
                    <h4 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '12px' }}>Projects & Assessments</h4>
                    {selectedStudent.projects.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No projects submitted.</p>
                    ) : selectedStudent.projects.map((proj, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '8px', padding: '10px', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}>
                        <strong>{proj.title}</strong>
                        {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--primary)' }}>GitHub</a>}
                      </div>
                    ))}

                    <h5 style={{ margin: '16px 0 8px 0' }}>Assessment History</h5>
                    {selectedStudent.assessmentScores.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No assessments taken.</p>
                    ) : selectedStudent.assessmentScores.map((score, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '4px', padding: '6px 10px', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}>
                        <span>{score.assessment_title}</span>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: 'var(--secondary)' }}>{parseFloat(score.percentage || 0).toFixed(1)}%</strong>
                          <span style={{
                            marginLeft: '8px', padding: '2px 6px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold',
                            backgroundColor: score.status === 'pass' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: score.status === 'pass' ? '#10B981' : '#EF4444'
                          }}>{score.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Applications & Offers */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <h4 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '12px' }}>Placements & Applications Pipeline</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                      <div>
                        <h5 style={{ margin: '0 0 8px 0' }}>Job Applications ({selectedStudent.applications.length})</h5>
                        {selectedStudent.applications.length === 0 ? (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No applications.</p>
                        ) : selectedStudent.applications.map((app, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '6px', padding: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}>
                            <strong>{app.job_title}</strong> at {app.company_name}
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>{app.status}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h5 style={{ margin: '0 0 8px 0' }}>Placement Offers ({selectedStudent.offers.length})</h5>
                        {selectedStudent.offers.length === 0 ? (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No placement offers.</p>
                        ) : selectedStudent.offers.map((off, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '6px', padding: '8px', backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '4px' }}>
                            <strong>{off.role}</strong> at {off.company_name}
                            <p style={{ margin: '2px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ₹{parseFloat(off.salary).toLocaleString('en-IN')} · {off.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </Card>
            )}
          </div>
        )}

        {toast && (
          <div className="toast-container">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStudents;
