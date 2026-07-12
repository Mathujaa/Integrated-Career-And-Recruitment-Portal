import React, { useEffect, useState } from 'react';
import EmployerLayout from '../components/EmployerLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const EmployerOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await apiClient.get('/employer/offers');
      setOffers(response.data.offers);
    } catch (err) {
      console.error(err);
      showToast('Failed to load extended offer letters.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleOpenDetail = (offer) => {
    setSelectedOffer(offer);
    setDetailModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', label: 'Accepted' };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', label: 'Declined' };
      case 'pending':
      default:
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', label: 'Pending Response' };
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
      <div className="fade-in">
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Extended Offers Board</h2>
          <p style={{ color: 'var(--text-muted)' }}>Monitor candidates accepting, declining, or reviewing active placement offer sheets.</p>
        </div>

        {offers.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
              No offers extended yet. You can extend offers to shortlisted candidates directly from the applicants tab.
            </p>
          </Card>
        ) : (
          <Card style={{ padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '12px 16px' }}>Candidate Name</th>
                    <th style={{ padding: '12px 16px' }}>Position / Role</th>
                    <th style={{ padding: '12px 16px' }}>Annual Package</th>
                    <th style={{ padding: '12px 16px' }}>Proposed Start</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((off, idx) => {
                    const badge = getStatusBadge(off.status);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {off.first_name} {off.last_name}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-light)' }}>{off.role}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                          INR {off.salary_offered ? off.salary_offered.toLocaleString() : 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                          {new Date(off.joining_date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            textTransform: 'uppercase'
                          }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Button variant="outline" onClick={() => handleOpenDetail(off)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            View Letter
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </div>

      {/* Offer Letter Details Modal */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Placement Offer Document Details">
        {selectedOffer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 'bold' }}>TechCorp Solutions Placement Letter</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Candidate: {selectedOffer.first_name} {selectedOffer.last_name} | Role: {selectedOffer.role}
              </p>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'Courier New', Courier, monospace",
              whiteSpace: 'pre-line',
              lineHeight: 1.6,
              color: 'var(--text-main)'
            }}>
              {selectedOffer.offer_text}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </EmployerLayout>
  );
};

export default EmployerOffers;
