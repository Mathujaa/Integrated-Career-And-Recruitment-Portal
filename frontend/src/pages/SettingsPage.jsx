import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/pages.css';

const SettingsPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  // Settings states
  const [recruiterVisible, setRecruiterVisible] = useState(true);
  const [emailNotify, setEmailNotify] = useState(true);
  const { toggleTheme, isDark } = useTheme();

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const { logout } = useAuth();
  const navigate = useNavigate();

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setUpdatingPass(true);
    setTimeout(() => {
      setUpdatingPass(false);
      showToast('Your account password has been updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1200);
  };

  const handleSavePreferences = () => {
    showToast('Preferences updated.');
  };

  const handleDeleteAccount = () => {
    setDeleting(true);
    setTimeout(async () => {
      setDeleting(false);
      setDeleteModalOpen(false);
      showToast('Account deleted successfully.', 'info');
      await logout();
      navigate('/login');
    }, 1500);
  };

  return (
    <StudentLayout>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure credentials, adjust recruiter visibilities, and notification preferences.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Column 1: Password Update */}
          <Card style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Change Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <Input
                label="Old Password"
                id="oldPass"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <Input
                label="New Password"
                id="newPass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm New Password"
                id="confirmNewPass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" fullWidth loading={updatingPass}>
                Update Password
              </Button>
            </form>
          </Card>

          {/* Column 2: Preferences & Delete */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <Card style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Privacy & Notifications</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="visible" checked={recruiterVisible} onChange={(e) => setRecruiterVisible(e.target.checked)} />
                  <label htmlFor="visible" style={{ fontSize: '0.95rem', fontWeight: 500 }}>Make profile visible to Recruiter search lists</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="emails" checked={emailNotify} onChange={(e) => setEmailNotify(e.target.checked)} />
                  <label htmlFor="emails" style={{ fontSize: '0.95rem', fontWeight: 500 }}>Receive notification alerts for matching jobs</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="theme" checked={isDark} onChange={toggleTheme} />
                  <label htmlFor="theme" style={{ fontSize: '0.95rem', fontWeight: 500 }}>Dark Mode theme styling</label>
                </div>
              </div>

              <Button variant="outline" fullWidth onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </Card>

            <Card style={{ padding: '28px', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.01)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--error)', marginBottom: '12px' }}>Danger Zone</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
                Deleting your account will permanently wipe your profile records, resume configurations, and applications. This is irreversible.
              </p>
              <Button variant="outline" style={{ borderColor: 'var(--error)', color: 'var(--error)', width: '100%' }} onClick={() => setDeleteModalOpen(true)}>
                Delete Account
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Account Confirm Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Account Deletion">
        <div style={{ padding: '10px 0' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '20px', lineHeight: 1.5 }}>
            Are you absolutely sure you want to delete your CareerPortal account? All applications history will be lost.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="secondary" style={{ backgroundColor: 'var(--error)' }} onClick={handleDeleteAccount} loading={deleting}>
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </StudentLayout>
  );
};

export default SettingsPage;
