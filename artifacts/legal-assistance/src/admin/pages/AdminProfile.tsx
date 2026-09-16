import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User,
  Clock,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const AdminProfile: React.FC<{ adminName?: string; adminEmail?: string }> = ({
  adminName = 'Nyaya Administrator',
  adminEmail = 'admin@nyaya.legal',
}) => {
  const { addToast } = useAdmin();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation password do not match.');
      return;
    }

    if (!currentPassword) {
      setPwError('Please enter your current administrator password.');
      return;
    }

    // Success simulation
    setPwSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast('Password updated', 'Your administrator password has been changed securely.');
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">ADMINISTRATOR CREDENTIALS</div>
          <h1 className="admin-page-title">Admin Account & Security</h1>
          <p className="admin-page-desc">
            Manage your administrative session, profile identity, and cryptographic access credentials.
          </p>
        </div>
      </div>

      <div className="profile-layout-grid">
        {/* Profile Card */}
        <div className="profile-hero-card">
          <div className="profile-avatar-large">ADM</div>
          <div className="profile-identity">
            <h2>{adminName}</h2>
            <p className="profile-email-sub">{adminEmail}</p>
            <div className="admin-clearance-pill">
              <ShieldCheck size={15} /> Super Administrator · Level 1 Clearance
            </div>
          </div>

          <div className="profile-facts-box">
            <div className="fact-item">
              <span className="label">Admin ID</span>
              <strong>ADM001</strong>
            </div>
            <div className="fact-item">
              <span className="label">Access Scope</span>
              <strong>Global Platform Root</strong>
            </div>
            <div className="fact-item">
              <span className="label">2FA Policy</span>
              <strong className="text-success">Enforced (Hardware/OTP)</strong>
            </div>
            <div className="fact-item">
              <span className="label">Session Cryptography</span>
              <strong>AES-256 / SHA-256 HMAC</strong>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="title-with-icon">
              <KeyRound size={19} className="text-primary" />
              <h3>Update Administrator Password</h3>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="settings-card-body">
            {pwError && (
              <div className="admin-alert-box alert-danger">
                <AlertCircle size={16} />
                <span>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="admin-alert-box alert-success">
                <CheckCircle2 size={16} />
                <span>Administrator password successfully rotated. All active sessions re-authenticated.</span>
              </div>
            )}

            <div className="admin-form-group">
              <label>Current Password</label>
              <div className="admin-input-icon-wrap">
                <Lock size={15} className="input-icon" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="admin-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="admin-form-group">
                <label>New Password (min 8 chars)</label>
                <div className="admin-input-icon-wrap">
                  <Lock size={15} className="input-icon" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    className="admin-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Confirm New Password</label>
                <div className="admin-input-icon-wrap">
                  <Lock size={15} className="input-icon" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    className="admin-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-submit-row">
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                <KeyRound size={15} /> Change Admin Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
