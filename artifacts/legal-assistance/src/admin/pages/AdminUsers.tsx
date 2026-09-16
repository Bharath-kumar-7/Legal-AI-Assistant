import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Eye,
  Edit2,
  Ban,
  RotateCcw,
  UserX,
  X,
  ShieldAlert,
  Calendar,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Copy,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminDataTable, Column } from '../components/AdminDataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ReasonModal } from '../components/ReasonModal';
import { ConfirmModal } from '../components/ConfirmModal';
import type { AdminUser, AccountStatus } from '../types';

export const AdminUsers: React.FC = () => {
  const {
    users,
    createUser,
    updateUser,
    suspendUser,
    restoreUser,
    deactivateUser,
    addToast,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'ALL'>('ALL');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<AdminUser | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<AdminUser | null>(null);
  const [userToRestore, setUserToRestore] = useState<AdminUser | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client' as 'client' | 'lawyer',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const counts = useMemo(() => {
    return {
      all: users.length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      suspended: users.filter((u) => u.status === 'SUSPENDED').length,
      deactivated: users.filter((u) => u.status === 'DEACTIVATED').length,
    };
  }, [users]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mId = u.id.toLowerCase().includes(q);
        const mName = u.name.toLowerCase().includes(q);
        const mEmail = u.email.toLowerCase().includes(q);
        const mPhone = u.phone.toLowerCase().includes(q);
        if (!mId && !mName && !mEmail && !mPhone) return false;
      }
      return true;
    });
  }, [users, search, statusFilter]);

  const formatDate = (iso?: string) => {
    if (!iso || iso === 'Never') return 'Never';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(text);
    addToast('Copied to clipboard', `${label} copied.`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateUser(selectedUser.id, editForm);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.phone) return;
    createUser(createForm);
    setShowCreateModal(false);
    setCreateForm({ name: '', email: '', phone: '', role: 'client' });
  };

  // Table Columns
  const columns: Column<AdminUser>[] = [
    {
      header: 'User ID',
      accessor: (user) => <code className="admin-mono-id">{user.id}</code>,
      width: '110px',
    },
    {
      header: 'User & Contact Information',
      accessor: (user) => (
        <div className="table-user-cell">
          <div className="table-avatar">{user.name.slice(0, 2).toUpperCase()}</div>
          <div className="table-user-info">
            <strong className="user-name">{user.name}</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="user-email">{user.email}</span>
              <button
                type="button"
                className="toast-close-btn"
                title="Copy email"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(user.email, 'Email address');
                }}
              >
                {copiedField === user.email ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              </button>
            </div>
            <small className="user-phone">{user.phone}</small>
          </div>
        </div>
      ),
    },
    {
      header: 'Account Status',
      accessor: (user) => <StatusBadge status={user.status} type="account" />,
      width: '160px',
    },
    {
      header: 'Registered On',
      accessor: (user) => formatDate(user.createdAt),
      width: '140px',
    },
    {
      header: 'Last Active',
      accessor: (user) => formatDate(user.lastLogin),
      width: '140px',
    },
    {
      header: 'Actions',
      accessor: (user) => (
        <div className="table-action-group" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="admin-icon-btn"
            title="Inspect Dossier"
            onClick={() => setSelectedUser(user)}
          >
            <Eye size={15} />
          </button>

          <button
            type="button"
            className="admin-icon-btn"
            title="Edit User Info"
            onClick={() => handleOpenEdit(user)}
          >
            <Edit2 size={15} />
          </button>

          {user.status === 'ACTIVE' && (
            <button
              type="button"
              className="admin-icon-btn text-warning"
              title="Suspend User"
              onClick={() => setUserToSuspend(user)}
            >
              <Ban size={15} />
            </button>
          )}

          {(user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') && (
            <button
              type="button"
              className="admin-icon-btn text-success"
              title="Restore User Account"
              onClick={() => setUserToRestore(user)}
            >
              <RotateCcw size={15} />
            </button>
          )}

          {user.status !== 'DEACTIVATED' && (
            <button
              type="button"
              className="admin-icon-btn text-danger"
              title="Soft-Delete / Deactivate"
              onClick={() => setUserToDeactivate(user)}
            >
              <UserX size={15} />
            </button>
          )}
        </div>
      ),
      width: '180px',
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">ACCOUNT REPOSITORY</div>
          <h1 className="admin-page-title">Client & User Directory</h1>
          <p className="admin-page-desc">
            Search, filter, view profile dossiers, manage temporary suspensions, and perform compliant soft-deletions.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus size={16} /> Provision User Account
          </button>
        </div>
      </div>

      {/* Status Filter Tabs / Chips */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          className={`admin-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All Accounts <span className="tab-badge">{counts.all}</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ACTIVE')}
        >
          Active <span className="tab-badge">{counts.active}</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${statusFilter === 'SUSPENDED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('SUSPENDED')}
        >
          Suspended {counts.suspended > 0 && <span className="tab-badge warning">{counts.suspended}</span>}
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${statusFilter === 'DEACTIVATED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('DEACTIVATED')}
        >
          Deactivated (Soft-Deleted) <span className="tab-badge">{counts.deactivated}</span>
        </button>
      </div>

      {/* Main Data Table */}
      <AdminDataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        searchPlaceholder="Search by ID, name, email, or phone..."
        searchValue={search}
        onSearchChange={setSearch}
        onRowClick={(u) => setSelectedUser(u)}
        emptyTitle="No clients found"
        emptyDescription="Try clearing your search query or selecting a different status tab."
      />

      {/* User Details Dossier Drawer */}
      {selectedUser && (
        <div className="admin-drawer-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="title-with-icon">
                <div className="table-avatar large">
                  {selectedUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <p className="modal-subtitle-text">ID: {selectedUser.id} · Role: Client</p>
                </div>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setSelectedUser(null)}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Account Status Card */}
              <div className="drawer-status-banner">
                <div>
                  <span className="label">Current Status:</span>
                  <StatusBadge status={selectedUser.status} type="account" />
                </div>
                {selectedUser.status === 'SUSPENDED' && selectedUser.suspensionReason && (
                  <div className="admin-alert-box alert-warning">
                    <ShieldAlert size={16} />
                    <div>
                      <strong>Suspension Reason:</strong>
                      <p>{selectedUser.suspensionReason}</p>
                    </div>
                  </div>
                )}
                {selectedUser.status === 'DEACTIVATED' && selectedUser.deactivationReason && (
                  <div className="admin-alert-box alert-danger">
                    <UserX size={16} />
                    <div>
                      <strong>Deactivation Reason:</strong>
                      <p>{selectedUser.deactivationReason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="detail-section">
                <span className="detail-section-title">Personal Contact Details</span>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-val">{selectedUser.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-val">{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone Number</span>
                    <span className="detail-val">{selectedUser.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Role</span>
                    <span className="detail-val capitalize">{selectedUser.role}</span>
                  </div>
                </div>
              </div>

              {/* Account Timestamps */}
              <div className="detail-section">
                <span className="detail-section-title">Activity Timestamps</span>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Registered Date</span>
                    <span className="detail-val">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Successful Login</span>
                    <span className="detail-val">{formatDate(selectedUser.lastLogin)}</span>
                  </div>
                </div>
              </div>

              {/* Administrative Timeline / History */}
              <div className="detail-section">
                <span className="detail-section-title">Administrative Audit Trail</span>
                {selectedUser.suspensionHistory && selectedUser.suspensionHistory.length > 0 ? (
                  <div className="activity-timeline" style={{ marginTop: '0.5rem' }}>
                    {selectedUser.suspensionHistory.map((h, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-top">
                            <span className="timeline-action">{h.type}</span>
                            <span className="timeline-admin">by {h.actionBy}</span>
                            <time className="timeline-time">{formatDate(h.date)}</time>
                          </div>
                          <p className="timeline-desc">{h.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="field-hint">No prior disciplinary or administrative actions on record.</p>
                )}
              </div>
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => handleOpenEdit(selectedUser)}
              >
                <Edit2 size={15} /> Edit Info
              </button>

              {selectedUser.status === 'ACTIVE' ? (
                <button
                  type="button"
                  className="admin-btn admin-btn-warning"
                  onClick={() => {
                    setUserToSuspend(selectedUser);
                    setSelectedUser(null);
                  }}
                >
                  <Ban size={15} /> Suspend Account
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    setUserToRestore(selectedUser);
                    setSelectedUser(null);
                  }}
                >
                  <RotateCcw size={15} /> Restore Account
                </button>
              )}

              {selectedUser.status !== 'DEACTIVATED' && (
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={() => {
                    setUserToDeactivate(selectedUser);
                    setSelectedUser(null);
                  }}
                >
                  <UserX size={15} /> Soft-Delete (Deactivate)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div className="title-with-icon">
                <UserPlus size={20} />
                <h3>Provision New Account</h3>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>
                    Account Type <span className="required-star">*</span>
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role: e.target.value as 'client' | 'lawyer' })
                    }
                    className="admin-select"
                  >
                    <option value="client">Client Account</option>
                    <option value="lawyer">Lawyer Account (Requires Bar Verification)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    className="admin-input"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>
                    Email Address <span className="required-star">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@example.com"
                    className="admin-input"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>
                    Phone Number <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    className="admin-input"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div className="title-with-icon">
                <Edit2 size={20} />
                <h3>Edit User: {selectedUser.id}</h3>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setShowEditModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    className="admin-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Modal with Mandatory Reason */}
      <ReasonModal
        isOpen={Boolean(userToSuspend)}
        title="Suspend Client Account"
        subtitle="Temporary restriction from platform access"
        entityName={userToSuspend?.name || ''}
        entityId={userToSuspend?.id || ''}
        actionType="SUSPEND"
        reasonPlaceholder="Specify the policy violation or complaint reference justifying suspension..."
        warningNote="Suspended users cannot book consultations, create cases, or message advocates until restored."
        confirmLabel="Confirm Suspension"
        onConfirm={(reason) => {
          if (userToSuspend) suspendUser(userToSuspend.id, reason);
          setUserToSuspend(null);
        }}
        onClose={() => setUserToSuspend(null)}
      />

      {/* Deactivate (Soft Delete) Modal with Mandatory Reason */}
      <ReasonModal
        isOpen={Boolean(userToDeactivate)}
        title="Deactivate Account (Soft Delete)"
        subtitle="Permanent disabled state while preserving historical audit records"
        entityName={userToDeactivate?.name || ''}
        entityId={userToDeactivate?.id || ''}
        actionType="DEACTIVATE"
        reasonPlaceholder="Specify the justification for soft-deleting this account (e.g. user request, legal compliance)..."
        warningNote="This account will be blocked from logging in. The record will remain in the database for historical and legal audit compliance."
        confirmLabel="Deactivate Account"
        onConfirm={(reason) => {
          if (userToDeactivate) deactivateUser(userToDeactivate.id, reason);
          setUserToDeactivate(null);
        }}
        onClose={() => setUserToDeactivate(null)}
      />

      {/* Restore Modal */}
      <ConfirmModal
        isOpen={Boolean(userToRestore)}
        title="Restore Account"
        message={`Are you sure you want to restore active access for ${userToRestore?.name} (${userToRestore?.id})?`}
        confirmLabel="Restore to Active"
        tone="success"
        onConfirm={() => {
          if (userToRestore) restoreUser(userToRestore.id);
          setUserToRestore(null);
        }}
        onClose={() => setUserToRestore(null)}
      />
    </div>
  );
};
