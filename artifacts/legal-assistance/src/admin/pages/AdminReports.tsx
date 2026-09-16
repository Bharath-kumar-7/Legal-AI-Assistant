import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Send,
  X,
  Clock,
  User,
  Scale,
  Ban,
  UserX,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminDataTable, Column } from '../components/AdminDataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ReasonModal } from '../components/ReasonModal';
import { ConfirmModal } from '../components/ConfirmModal';
import type {
  AdminComplaint,
  ComplaintStatus,
  ComplaintCategory,
} from '../types';

export const AdminReports: React.FC = () => {
  const {
    complaints,
    updateComplaintStatus,
    addComplaintNote,
    suspendUser,
    suspendLawyer,
    deactivateUser,
    deactivateLawyer,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'ALL'>('ALL');

  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null);
  const [newNote, setNewNote] = useState('');

  // Modals
  const [resolveTarget, setResolveTarget] = useState<AdminComplaint | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminComplaint | null>(null);

  const statusCounts = useMemo(() => {
    return {
      all: complaints.length,
      pending: complaints.filter((c) => c.status === 'PENDING').length,
      underReview: complaints.filter((c) => c.status === 'UNDER_REVIEW').length,
      resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
      rejected: complaints.filter((c) => c.status === 'REJECTED').length,
    };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mId = c.id.toLowerCase().includes(q);
        const mReporter = c.reportedBy.name.toLowerCase().includes(q);
        const mReported = c.reportedUser.name.toLowerCase().includes(q);
        const mDesc = c.description.toLowerCase().includes(q);
        if (!mId && !mReporter && !mReported && !mDesc) return false;
      }
      return true;
    });
  }, [complaints, statusFilter, categoryFilter, search]);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !newNote.trim()) return;
    addComplaintNote(selectedComplaint.id, newNote.trim());
    setSelectedComplaint((prev) =>
      prev
        ? {
            ...prev,
            adminNotes: prev.adminNotes ? `${prev.adminNotes}\n---\n${newNote.trim()}` : newNote.trim(),
          }
        : null
    );
    setNewNote('');
  };

  const handleStatusChange = (status: ComplaintStatus) => {
    if (!selectedComplaint) return;
    if (status === 'RESOLVED') {
      setResolveTarget(selectedComplaint);
      return;
    }
    if (status === 'REJECTED') {
      setRejectTarget(selectedComplaint);
      return;
    }
    updateComplaintStatus(selectedComplaint.id, status, selectedComplaint.adminNotes || '');
    setSelectedComplaint((prev) => (prev ? { ...prev, status } : null));
  };

  const columns: Column<AdminComplaint>[] = [
    {
      header: 'Complaint ID',
      accessor: (c) => <code className="admin-mono-id">{c.id}</code>,
      width: '120px',
    },
    {
      header: 'Reported Subject',
      accessor: (c) => (
        <div className="table-user-cell">
          <div className={`table-avatar ${c.reportedUser.role === 'lawyer' ? 'gold' : ''}`}>
            {c.reportedUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="table-user-info">
            <strong className="user-name">{c.reportedUser.name}</strong>
            <span className="user-email">
              {c.reportedUser.role.toUpperCase()} · <code>{c.reportedUser.id}</code>
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Filing Party (Reporter)',
      accessor: (c) => (
        <div>
          <strong>{c.reportedBy.name}</strong>
          <div className="user-email">{c.reportedBy.email}</div>
        </div>
      ),
    },
    {
      header: 'Violation Category',
      accessor: (c) => (
        <span className="admin-badge admin-badge-neutral">
          {c.category.replace('_', ' ')}
        </span>
      ),
      width: '160px',
    },
    {
      header: 'Investigation Status',
      accessor: (c) => <StatusBadge status={c.status} type="complaint" />,
      width: '160px',
    },
    {
      header: 'Submitted',
      accessor: (c) => formatDate(c.createdAt),
      width: '140px',
    },
    {
      header: 'Actions',
      accessor: (c) => (
        <div className="table-action-group" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary compact"
            onClick={() => setSelectedComplaint(c)}
          >
            <Eye size={14} /> Investigate
          </button>
        </div>
      ),
      width: '120px',
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">COMPLIANCE & GOVERNANCE</div>
          <h1 className="admin-page-title">Reports & Grievance Queue</h1>
          <p className="admin-page-desc">
            Investigate client and advocate grievances, review evidentiary attachments, maintain investigation notes, and execute administrative sanctions.
          </p>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          className={`admin-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All Complaints <span className="tab-badge">{statusCounts.all}</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setStatusFilter('PENDING')}
        >
          Pending Review {statusCounts.pending > 0 && <span className="tab-badge warning">{statusCounts.pending}</span>}
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${statusFilter === 'UNDER_REVIEW' ? 'active' : ''}`}
          onClick={() => setStatusFilter('UNDER_REVIEW')}
        >
          Under Investigation <span className="tab-badge">{statusCounts.underReview}</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('RESOLVED')}
        >
          Resolved <span className="tab-badge">{statusCounts.resolved}</span>
        </button>
      </div>

      {/* Main Table */}
      <AdminDataTable
        data={filteredComplaints}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search by ID, reporter, reported user, or description..."
        searchValue={search}
        onSearchChange={setSearch}
        onRowClick={(c) => setSelectedComplaint(c)}
        extraFilters={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | 'ALL')}
            className="admin-select compact"
          >
            <option value="ALL">All Categories</option>
            <option value="MISCONDUCT">Misconduct</option>
            <option value="BILLING">Billing Dispute</option>
            <option value="UNRESPONSIVE">Unresponsive Advocate</option>
            <option value="HARASSMENT">Harassment</option>
            <option value="DATA_PRIVACY">Data Privacy</option>
            <option value="OTHER">Other</option>
          </select>
        }
        emptyTitle="No complaints found"
        emptyDescription="No reports match the selected filters."
      />

      {/* Complaint Investigation Drawer */}
      {selectedComplaint && (
        <div className="admin-drawer-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="admin-drawer wide" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="title-with-icon">
                <ShieldAlert size={20} className="text-danger" />
                <div>
                  <h3>Complaint Investigation #{selectedComplaint.id}</h3>
                  <p className="modal-subtitle-text">
                    Category: {selectedComplaint.category} · Status: {selectedComplaint.status}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setSelectedComplaint(null)}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Status & Quick Transition */}
              <div className="drawer-status-banner">
                <div className="status-cell">
                  <span className="label">Investigation Status:</span>
                  <StatusBadge status={selectedComplaint.status} type="complaint" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="label">Transition State:</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className={`admin-btn compact ${
                        selectedComplaint.status === 'UNDER_REVIEW'
                          ? 'admin-btn-primary'
                          : 'admin-btn-secondary'
                      }`}
                      onClick={() => handleStatusChange('UNDER_REVIEW')}
                    >
                      Under Review
                    </button>
                    <button
                      type="button"
                      className={`admin-btn compact ${
                        selectedComplaint.status === 'ESCALATED'
                          ? 'admin-btn-danger'
                          : 'admin-btn-secondary'
                      }`}
                      onClick={() => handleStatusChange('ESCALATED')}
                    >
                      Escalate
                    </button>
                    <button
                      type="button"
                      className="admin-btn compact admin-btn-success"
                      onClick={() => handleStatusChange('RESOLVED')}
                    >
                      <CheckCircle2 size={13} /> Resolve
                    </button>
                  </div>
                </div>
              </div>

              {/* Parties In Conflict */}
              <div className="detail-section">
                <span className="detail-section-title">Parties Involved in Matter</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div className="settings-card" style={{ padding: '1rem', background: 'var(--admin-surface-subtle)' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--admin-text-tertiary)' }}>
                      Filing Party ({selectedComplaint.reportedBy.role.toUpperCase()})
                    </span>
                    <strong style={{ display: 'block', fontSize: '0.92rem', marginTop: '0.25rem' }}>
                      {selectedComplaint.reportedBy.name}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)' }}>
                      {selectedComplaint.reportedBy.email}
                    </span>
                    <small style={{ display: 'block', marginTop: '0.2rem', fontFamily: 'var(--admin-font-mono)' }}>
                      ID: {selectedComplaint.reportedBy.id}
                    </small>
                  </div>

                  <div className="settings-card" style={{ padding: '1rem', background: 'var(--admin-surface-subtle)', borderLeft: '3px solid var(--admin-danger)' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--admin-danger-text)' }}>
                      Reported Party ({selectedComplaint.reportedUser.role.toUpperCase()})
                    </span>
                    <strong style={{ display: 'block', fontSize: '0.92rem', marginTop: '0.25rem' }}>
                      {selectedComplaint.reportedUser.name}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)' }}>
                      {selectedComplaint.reportedUser.email}
                    </span>
                    <small style={{ display: 'block', marginTop: '0.2rem', fontFamily: 'var(--admin-font-mono)' }}>
                      ID: {selectedComplaint.reportedUser.id}
                    </small>
                  </div>
                </div>
              </div>

              {/* Narrative */}
              <div className="detail-section">
                <span className="detail-section-title">Grievance Narrative</span>
                <div className="bio-text">
                  <p>{selectedComplaint.description}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                <div className="detail-section">
                  <span className="detail-section-title">
                    Evidentiary Attachments ({selectedComplaint.attachments.length})
                  </span>
                  <div className="document-list">
                    {selectedComplaint.attachments.map((att, idx) => (
                      <div key={idx} className="doc-tile">
                        <FileText size={18} className="text-primary" />
                        <div className="doc-info">
                          <strong>{att.name}</strong>
                          <span>{att.type} · {att.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Administrative Notes & Investigation Log */}
              <div className="detail-section">
                <span className="detail-section-title">Internal Investigation Thread</span>
                {selectedComplaint.adminNotes ? (
                  <div style={{ backgroundColor: 'var(--admin-surface-subtle)', padding: '1rem 1.25rem', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border-subtle)', whiteSpace: 'pre-wrap', fontSize: '0.84rem', lineHeight: '1.6' }}>
                    {selectedComplaint.adminNotes}
                  </div>
                ) : (
                  <p className="field-hint">No internal notes recorded yet.</p>
                )}

                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Append internal investigation note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="admin-input"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="admin-btn admin-btn-secondary"
                  >
                    <Send size={14} /> Add Note
                  </button>
                </form>
              </div>
            </div>

            {/* Action Footer */}
            <div className="drawer-footer">
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => {
                  if (selectedComplaint.reportedUser.role === 'client') {
                    suspendUser(
                      selectedComplaint.reportedUser.id,
                      `Suspended following investigation of complaint #${selectedComplaint.id}`
                    );
                  } else {
                    suspendLawyer(
                      selectedComplaint.reportedUser.id,
                      `Suspended following investigation of complaint #${selectedComplaint.id}`
                    );
                  }
                  setSelectedComplaint(null);
                }}
              >
                <Ban size={15} /> Suspend Reported Account
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  setRejectTarget(selectedComplaint);
                }}
              >
                <XCircle size={15} /> Dismiss
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  setResolveTarget(selectedComplaint);
                }}
              >
                <CheckCircle2 size={15} /> Resolve & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Complaint Modal */}
      <ReasonModal
        isOpen={Boolean(resolveTarget)}
        title="Resolve & Close Grievance"
        subtitle="Mandatory resolution summary for compliance audit"
        entityName={`Complaint #${resolveTarget?.id}`}
        entityId={resolveTarget?.reportedUser.name || ''}
        actionType="RESOLVE"
        reasonPlaceholder="Specify resolution actions taken (e.g., dispute settled, fee refunded, formal warning issued)..."
        confirmLabel="Confirm Resolution"
        onConfirm={(resolutionNotes) => {
          if (resolveTarget) {
            updateComplaintStatus(resolveTarget.id, 'RESOLVED', resolutionNotes);
          }
          setResolveTarget(null);
          setSelectedComplaint(null);
        }}
        onClose={() => setResolveTarget(null)}
      />

      {/* Reject/Dismiss Complaint Modal */}
      <ReasonModal
        isOpen={Boolean(rejectTarget)}
        title="Dismiss Grievance"
        subtitle="Record justification for closing complaint as invalid"
        entityName={`Complaint #${rejectTarget?.id}`}
        entityId={rejectTarget?.reportedUser.name || ''}
        actionType="REJECT"
        reasonPlaceholder="Specify reason for dismissal (e.g., non-actionable, lack of corroborating evidence)..."
        confirmLabel="Dismiss Grievance"
        onConfirm={(reason) => {
          if (rejectTarget) {
            updateComplaintStatus(rejectTarget.id, 'REJECTED', reason);
          }
          setRejectTarget(null);
          setSelectedComplaint(null);
        }}
        onClose={() => setRejectTarget(null)}
      />
    </div>
  );
};
