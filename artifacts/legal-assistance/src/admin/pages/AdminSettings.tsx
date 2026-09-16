import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  AlertTriangle,
  Plus,
  X,
  Save,
  Check,
  Power,
  Users,
  Scale,
  Bell,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { ConfirmModal } from '../components/ConfirmModal';
import type { PlatformSettings } from '../types';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, addSpecialization, removeSpecialization } = useAdmin();

  // Working copy of form state
  const [formData, setFormData] = useState<PlatformSettings>(settings);
  const [newSpecInput, setNewSpecInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddSpec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecInput.trim()) return;
    addSpecialization(newSpecInput.trim());
    setFormData((prev) => ({
      ...prev,
      lawyers: {
        ...prev.lawyers,
        specializations: [...prev.lawyers.specializations, newSpecInput.trim()],
      },
    }));
    setNewSpecInput('');
  };

  const handleRemoveSpec = (spec: string) => {
    removeSpecialization(spec);
    setFormData((prev) => ({
      ...prev,
      lawyers: {
        ...prev.lawyers,
        specializations: prev.lawyers.specializations.filter((s) => s !== spec),
      },
    }));
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">SYSTEM CONFIGURATION</div>
          <h1 className="admin-page-title">Platform & Governance Settings</h1>
          <p className="admin-page-desc">
            Manage operational flags, lawyer verification policies, specialization taxonomies, and emergency maintenance controls.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={!isDirty}
          >
            {saved ? (
              <>
                <Check size={16} /> Saved Successfully
              </>
            ) : (
              <>
                <Save size={16} /> Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      {isDirty && (
        <div className="admin-alert-box alert-warning">
          <AlertTriangle size={17} />
          <span>You have unsaved changes. Remember to click &ldquo;Save Configuration&rdquo; to apply updates.</span>
        </div>
      )}

      <div className="settings-grid-layout">
        {/* General System & Maintenance Mode */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="title-with-icon">
              <Settings size={19} className="text-primary" />
              <h3>General System Identity & Emergency Controls</h3>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="admin-form-group">
              <label>Platform Name</label>
              <input
                type="text"
                className="admin-input"
                value={formData.general.platformName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, platformName: e.target.value },
                  })
                }
              />
            </div>

            <div className="form-grid-2">
              <div className="admin-form-group">
                <label>Support Email Address</label>
                <input
                  type="email"
                  className="admin-input"
                  value={formData.general.supportEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, supportEmail: e.target.value },
                    })
                  }
                />
              </div>

              <div className="admin-form-group">
                <label>Support Phone / Hotline</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.general.supportPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, supportPhone: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            {/* Maintenance Mode Callout */}
            <div
              className={`maintenance-toggle-block ${
                formData.general.maintenanceMode ? 'maintenance-on' : ''
              }`}
            >
              <div className="maintenance-info">
                <div className="m-title">
                  <Power size={18} />
                  <strong>Maintenance Mode</strong>
                </div>
                <p>
                  When enabled, all non-admin routes will present a maintenance notice and disallow new case creation or bookings.
                </p>
              </div>
              <button
                type="button"
                className={`admin-btn ${
                  formData.general.maintenanceMode ? 'admin-btn-danger' : 'admin-btn-secondary'
                }`}
                onClick={() => {
                  if (!formData.general.maintenanceMode) {
                    setShowMaintenanceConfirm(true);
                  } else {
                    setFormData({
                      ...formData,
                      general: { ...formData.general, maintenanceMode: false },
                    });
                  }
                }}
              >
                {formData.general.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
              </button>
            </div>

            {formData.general.maintenanceMode && (
              <div className="admin-form-group" style={{ marginTop: '1rem' }}>
                <label>Public Maintenance Notice Message</label>
                <textarea
                  rows={2}
                  className="admin-textarea"
                  value={formData.general.maintenanceMessage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, maintenanceMessage: e.target.value },
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Lawyer Verification Policies */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="title-with-icon">
              <Scale size={19} className="text-primary" />
              <h3>Lawyer & Advocate Compliance Rules</h3>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="toggle-row-item">
              <div>
                <strong>Mandatory Bar Council Certificate Review</strong>
                <p>Require manual administrator approval of Bar enrollment IDs before advocates can accept client cases.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.lawyers.requireBarVerification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lawyers: { ...formData.lawyers, requireBarVerification: e.target.checked },
                  })
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Re-verification Grace Period (Days)</label>
              <input
                type="number"
                min={1}
                max={30}
                className="admin-input compact"
                value={formData.lawyers.autoReviewGracePeriodDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lawyers: {
                      ...formData.lawyers,
                      autoReviewGracePeriodDays: Number(e.target.value),
                    },
                  })
                }
              />
            </div>

            {/* Specialization Taxonomy Manager */}
            <div className="specializations-manager">
              <label className="section-label">Supported Legal Specializations</label>
              <div className="spec-tag-list">
                {formData.lawyers.specializations.map((spec) => (
                  <span key={spec} className="spec-tag">
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(spec)}
                      title={`Remove ${spec}`}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="add-spec-form">
                <input
                  type="text"
                  placeholder="e.g. Environmental Law"
                  value={newSpecInput}
                  onChange={(e) => setNewSpecInput(e.target.value)}
                  className="admin-input compact"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary compact"
                  onClick={handleAddSpec}
                >
                  <Plus size={14} /> Add Category
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Account Policies */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="title-with-icon">
              <Users size={19} className="text-primary" />
              <h3>Client Account Policies</h3>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="toggle-row-item">
              <div>
                <strong>Allow Public Client Signups</strong>
                <p>Enable or pause new client registrations on the landing page.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.users.allowRegistration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    users: { ...formData.users, allowRegistration: e.target.checked },
                  })
                }
              />
            </div>

            <div className="toggle-row-item">
              <div>
                <strong>Mandatory Phone OTP Verification</strong>
                <p>Require verified Indian mobile numbers before filing consumer disputes or case briefs.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.users.requirePhoneVerification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    users: { ...formData.users, requirePhoneVerification: e.target.checked },
                  })
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Maximum Active Matters / Cases Per Client</label>
              <input
                type="number"
                min={1}
                max={100}
                className="admin-input compact"
                value={formData.users.maxCasesPerClient}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    users: { ...formData.users, maxCasesPerClient: Number(e.target.value) },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Notification Delivery Channels */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="title-with-icon">
              <Bell size={19} className="text-primary" />
              <h3>Notification Dispatch Channels</h3>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="toggle-row-item">
              <div>
                <strong>Email Transactional Alerts</strong>
                <p>Send email receipts and consultation links to clients and lawyers.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.emailNotificationsEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      emailNotificationsEnabled: e.target.checked,
                    },
                  })
                }
              />
            </div>

            <div className="toggle-row-item">
              <div>
                <strong>SMS Hearing Reminders</strong>
                <p>Dispatch SMS reminder notifications 24h prior to booked consultations.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.smsAlertsEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      smsAlertsEnabled: e.target.checked,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Confirmation Modal */}
      <ConfirmModal
        isOpen={showMaintenanceConfirm}
        title="Activate Platform Maintenance Mode?"
        message="Enabling maintenance mode will restrict access for all normal client and advocate users. The public maintenance message will be displayed on all entry points."
        confirmLabel="Activate Maintenance"
        tone="danger"
        onConfirm={() => {
          setFormData({
            ...formData,
            general: { ...formData.general, maintenanceMode: true },
          });
          setShowMaintenanceConfirm(false);
        }}
        onClose={() => setShowMaintenanceConfirm(false)}
      />
    </div>
  );
};
