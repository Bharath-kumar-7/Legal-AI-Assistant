import React, { useState } from 'react';
import {
  BellRing,
  Plus,
  Send,
  Trash2,
  Power,
  Calendar,
  AlertTriangle,
  Users,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminDataTable, Column } from '../components/AdminDataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import type {
  AdminNotification,
  NotificationAudience,
  NotificationPriority,
} from '../types';

export const AdminNotifications: React.FC = () => {
  const { notifications, createNotification, toggleNotification, deleteNotification } = useAdmin();

  const [showComposer, setShowComposer] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<AdminNotification | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    message: '',
    audience: 'ALL_USERS' as NotificationAudience,
    targetId: '',
    priority: 'NORMAL' as NotificationPriority,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
  });

  const isFormDirty = Boolean(form.title || form.message);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;

    createNotification({
      title: form.title.trim(),
      message: form.message.trim(),
      audience: form.audience,
      targetId: form.targetId.trim() || undefined,
      priority: form.priority,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      createdBy: 'Chief Administrator (ADM001)',
    });

    setForm({
      title: '',
      message: '',
      audience: 'ALL_USERS',
      targetId: '',
      priority: 'NORMAL',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
    });
    setShowComposer(false);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'Ongoing';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const columns: Column<AdminNotification>[] = [
    {
      header: 'ID',
      accessor: (n) => <code className="admin-mono-id">{n.id}</code>,
      width: '90px',
    },
    {
      header: 'Announcement Details',
      accessor: (n) => (
        <div className="table-announcement-cell">
          <strong>{n.title}</strong>
          <p className="announcement-msg">{n.message}</p>
        </div>
      ),
    },
    {
      header: 'Target Audience',
      accessor: (n) => (
        <span className="audience-pill">
          {n.audience === 'ALL_USERS' && <Users size={13} />}
          {n.audience === 'ALL_LAWYERS' && <Scale size={13} />}
          {n.audience === 'SPECIFIC_USERS' && <Users size={13} />}
          {n.audience.replace('_', ' ')}
          {n.targetId && ` (${n.targetId})`}
        </span>
      ),
      width: '180px',
    },
    {
      header: 'Priority',
      accessor: (n) => <StatusBadge status={n.priority} type="priority" />,
      width: '130px',
    },
    {
      header: 'Schedule',
      accessor: (n) => (
        <div className="schedule-info">
          <span>Start: {formatDate(n.startDate)}</span>
          <small>End: {formatDate(n.endDate)}</small>
        </div>
      ),
      width: '150px',
    },
    {
      header: 'Status',
      accessor: (n) => (
        <button
          type="button"
          className={`status-toggle-btn ${n.isActive ? 'active' : 'inactive'}`}
          onClick={() => toggleNotification(n.id)}
          title="Toggle broadcast status"
        >
          <Power size={13} /> {n.isActive ? 'Active' : 'Paused'}
        </button>
      ),
      width: '120px',
    },
    {
      header: 'Actions',
      accessor: (n) => (
        <button
          type="button"
          className="admin-icon-btn text-danger"
          title="Delete Announcement"
          onClick={() => setNotificationToDelete(n)}
        >
          <Trash2 size={15} />
        </button>
      ),
      width: '80px',
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">COMMUNICATIONS & BROADCASTS</div>
          <h1 className="admin-page-title">Platform Notifications & Announcements</h1>
          <p className="admin-page-desc">
            Publish platform-wide maintenance alerts, legal advisory bulletins, and targeted account notices.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setShowComposer(!showComposer)}
          >
            {showComposer ? 'Close Composer' : <><Plus size={16} /> Create Broadcast</>}
          </button>
        </div>
      </div>

      {/* Broadcast Composer */}
      {showComposer && (
        <div className="admin-composer-card">
          <div className="composer-header">
            <div className="title-with-icon">
              <BellRing size={20} className="text-primary" />
              <h3>Draft Platform Announcement</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="composer-form">
            <div className="form-grid-2">
              <div className="admin-form-group">
                <label>
                  Announcement Title <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled System Maintenance: Sunday 2 AM"
                  className="admin-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Target Audience</label>
                <select
                  value={form.audience}
                  onChange={(e) =>
                    setForm({ ...form, audience: e.target.value as NotificationAudience })
                  }
                  className="admin-select"
                >
                  <option value="ALL_USERS">All Platform Users (Clients & Advocates)</option>
                  <option value="ALL_LAWYERS">All Registered Advocates Only</option>
                  <option value="SPECIFIC_USERS">Specific Client Account</option>
                  <option value="SPECIFIC_LAWYERS">Specific Advocate Account</option>
                </select>
              </div>
            </div>

            {(form.audience === 'SPECIFIC_USERS' || form.audience === 'SPECIFIC_LAWYERS') && (
              <div className="admin-form-group">
                <label>Target Account ID <span className="required-star">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. USR101 or LAW102"
                  className="admin-input"
                  value={form.targetId}
                  onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                />
              </div>
            )}

            <div className="admin-form-group">
              <label>
                Announcement Body / Message <span className="required-star">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Enter the full message text visible to the target audience..."
                className="admin-textarea"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <div className="form-grid-3">
              <div className="admin-form-group">
                <label>Priority Level</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as NotificationPriority })
                  }
                  className="admin-select"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Alert Banner</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Display Start Date</label>
                <input
                  type="date"
                  className="admin-input"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Expiry / End Date (Optional)</label>
                <input
                  type="date"
                  className="admin-input"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="composer-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowComposer(false)}
              >
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn-primary">
                <Send size={16} /> Publish Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements Table */}
      <AdminDataTable
        data={notifications}
        columns={columns}
        keyExtractor={(n) => n.id}
        emptyTitle="No platform announcements"
        emptyDescription="Create your first announcement to broadcast updates across the platform."
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(notificationToDelete)}
        title="Delete Announcement"
        message={`Are you sure you want to remove announcement "${notificationToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete Announcement"
        tone="danger"
        onConfirm={() => {
          if (notificationToDelete) deleteNotification(notificationToDelete.id);
          setNotificationToDelete(null);
        }}
        onClose={() => setNotificationToDelete(null)}
      />
    </div>
  );
};
