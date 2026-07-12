import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const AdminReports = () => {
  const [reportType, setReportType] = useState('students');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadReportData = async () => {
    setLoading(true);
    setPreviewData(null);
    try {
      let endpoint = '';
      if (reportType === 'students') endpoint = '/admin/students';
      else if (reportType === 'recruiters') endpoint = '/admin/recruiters';
      else if (reportType === 'jobs') endpoint = '/admin/jobs';
      else if (reportType === 'assessments') endpoint = '/admin/assessments';
      else if (reportType === 'interviews') endpoint = '/admin/interviews';
      else if (reportType === 'offers') endpoint = '/admin/offers';

      const res = await apiClient.get(endpoint);
      
      let rows = [];
      if (reportType === 'students') rows = res.data.rows || [];
      else if (reportType === 'recruiters') rows = res.data.rows || [];
      else if (reportType === 'jobs') rows = res.data.jobs || [];
      else if (reportType === 'assessments') rows = res.data.assessments || [];
      else if (reportType === 'interviews') rows = res.data.interviews || [];
      else if (reportType === 'offers') rows = res.data.offers || [];

      setPreviewData(rows);
    } catch (err) {
      console.error(err);
      showToast('Failed to load report data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  const handleDownloadExcel = () => {
    if (!previewData || previewData.length === 0) {
      showToast('No data available to download. Please load report first.', 'warning');
      return;
    }
    const csvContent = convertToCSV(previewData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${reportType}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Excel-compatible CSV report successfully downloaded.');
  };

  const handlePrintPDF = () => {
    if (!previewData || previewData.length === 0) {
      showToast('No data available to print. Please load report first.', 'warning');
      return;
    }
    window.print();
  };

  return (
    <AdminLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>📋 Placement Reports Center</h2>
          <p style={{ color: 'var(--text-muted)' }}>Generate and download database reports in Excel/CSV formats or compile print layouts as PDF files.</p>
        </div>

        <Card style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Select Dataset Category</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setPreviewData(null);
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontWeight: 600
              }}
            >
              <option value="students">Students database (CGPA, Headline, Status)</option>
              <option value="recruiters">Recruiter Registrations (Approval pipeline)</option>
              <option value="jobs">Job listings & Applications counts</option>
              <option value="assessments">Skill Assessments attempts</option>
              <option value="interviews">Interview schedules</option>
              <option value="offers">Extended placement offers</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button variant="primary" onClick={loadReportData}>Load Report Preview</Button>
            <Button variant="outline" onClick={handleDownloadExcel} disabled={!previewData}>Download Excel (CSV)</Button>
            <Button variant="outline" onClick={handlePrintPDF} disabled={!previewData}>Generate PDF (Print)</Button>
          </div>
        </Card>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
            <Spinner size="md" />
          </div>
        )}

        {/* Printable print section */}
        {previewData && (
          <Card style={{ padding: '32px' }} id="printable-report-card">
            <div style={{ marginBottom: '24px', borderBottom: '2px solid var(--primary)', paddingBottom: '16px' }} className="print-header">
              <h3 style={{ textTransform: 'capitalize', fontSize: '1.4rem', color: 'var(--primary)', margin: '0 0 6px 0' }}>
                System report: {reportType}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Compiled on: {new Date().toLocaleString()} | Total Records: {previewData.length}
              </span>
            </div>

            {previewData.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '40px 0' }}>No records found in this category.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-light)' }}>
                      {Object.keys(previewData[0]).slice(0, 7).map((key, i) => (
                        <th key={i} style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.75rem' }}>{key.replace('_', ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        {Object.keys(row).slice(0, 7).map((key, i) => (
                          <td key={i} style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                            {typeof row[key] === 'object' ? JSON.stringify(row[key]) : '' + (row[key] ?? 'N/A')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {toast && (
          <div className="toast-container">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        {/* CSS for print layouts */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-report-card, #printable-report-card * {
              visibility: visible;
            }
            #printable-report-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              box-shadow: none !important;
              background-color: white !important;
              color: black !important;
            }
            .print-header {
              border-bottom: 2px solid #4F46E5 !important;
            }
          }
        `}} />

      </div>
    </AdminLayout>
  );
};

export default AdminReports;
