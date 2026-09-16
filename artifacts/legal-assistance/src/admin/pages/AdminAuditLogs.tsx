import React, { useState, useMemo } from 'react';
import {
  ScrollText,
  ShieldCheck,
  Eye,
  Clock,
  Filter,
  X,
  FileCode2,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminDataTable, Column } from '../components/AdminDataTable';
import type { AdminAuditLog } from '../types';

export const AdminAuditLogs: React.FC = () => {
  const { auditLogs } = useAdmin();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
      if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mId = log.id.toLowerCase().includes(q);
        const mAdmin = log.adminName.toLowerCase().includes(q) || log.adminId.toLowerCase().includes(q);
        const mEntity = log.entityId.toLowerCase().includes(q);
        const mDesc = log.description.toLowerCase().includes(q);
        if (!mId && !mAdmin && !mEntity && !mDesc) return false;
      }
      return true;
    });
  }, [auditLogs, actionFilter, entityFilter, search]);

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
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const columns: Column<AdminAuditLog>[] = [
    {
      header: 'Log ID',
      accessor: (log) => <code className="admin-mono-id">{log.id}</code>,
      width: '110px',
    },
    {
      header: 'Timestamp',
      accessor: (log) => (
        <span className="log-timestamp">
          <Clock size={13} /> {formatDate(log.timestamp)}
        </span>
      ),
      width: '180px',
    },
    {
      header: 'Action Taken',
      accessor: (log) => (
        <span className={`log-action-badge action-${log.action.toLowerCase()}`}>
          {log.action.replaceAll('_', ' ')}
        </span>
      ),
      width: '170px',
    },
    {
      header: 'Entity / Target',
      accessor: (log) => (
        <div className="log-entity-cell">
          <span className="entity-type-tag">{log.entityType}</span>
          <code>{log.entityId}</code>
        </div>
      ),
      width: '170px',
    },
    {
      header: 'Description & Reason',
      accessor: (log) => (
        <div className="log-desc-cell">
          <p className="log-desc">{log.description}</p>
          {log.reason && <small className="log-reason">Reason: {log.reason}</small>}
        </div>
      ),
    },
    {
      header: 'Administrator',
      accessor: (log) => (
        <div className="log-admin-info">
          <strong>{log.adminName}</strong>
          <small>{log.adminId}</small>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Inspect',
      accessor: (log) => (
        <button
          type="button"
          className="admin-icon-btn"
          title="Inspect Diff"
          onClick={() => setSelectedLog(log)}
        >
          <Eye size={15} />
        </button>
      ),
      width: '80px',
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">SECURITY AUDIT TRAIL</div>
          <h1 className="admin-page-title">Immutable Administrative Audit Logs</h1>
          <p className="admin-page-desc">
            Complete, tamper-evident chronological record of all administrative operations, approvals, sanctions, and system mutations.
          </p>
        </div>
        <div className="header-actions">
          <div className="secure-badge large">
            <ShieldCheck size={16} /> Immutable Ledger
          </div>
        </div>
      </div>

      {/* Main Table */}
      <AdminDataTable
        data={filteredLogs}
        columns={columns}
        keyExtractor={(l) => l.id}
        searchPlaceholder="Search audit logs by ID, admin, entity, or keyword..."
        searchValue={search}
        onSearchChange={setSearch}
        onRowClick={(l) => setSelectedLog(l)}
        extraFilters={
          <>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="admin-select compact"
            >
              <option value="ALL">All Actions</option>
              <option value="APPROVE_LAWYER">Approve Lawyer</option>
              <option value="REJECT_LAWYER">Reject Lawyer</option>
              <option value="SUSPEND_USER">Suspend User</option>
              <option value="RESTORE_USER">Restore User</option>
              <option value="DEACTIVATE_USER">Deactivate User</option>
              <option value="SUSPEND_LAWYER">Suspend Lawyer</option>
              <option value="RESTORE_LAWYER">Restore Lawyer</option>
              <option value="DEACTIVATE_LAWYER">Deactivate Lawyer</option>
              <option value="CREATE_USER">Create User</option>
              <option value="CREATE_NOTIFICATION">Create Notification</option>
              <option value="UPDATE_SETTINGS">Update Settings</option>
              <option value="RESOLVE_COMPLAINT">Resolve Complaint</option>
            </select>

            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="admin-select compact"
            >
              <option value="ALL">All Entity Types</option>
              <option value="USER">User Entity</option>
              <option value="LAWYER">Lawyer Entity</option>
              <option value="COMPLAINT">Complaint Entity</option>
              <option value="SETTINGS">Settings Entity</option>
              <option value="NOTIFICATION">Notification Entity</option>
            </select>
          </>
        }
        emptyTitle="No audit records match your query"
        emptyDescription="Try clearing filters or search keywords."
      />

      {/* Log Detail / Diff Inspector Modal */}
      {selectedLog && (
        <div className="admin-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="admin-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="title-with-icon">
                <FileCode2 size={20} className="text-primary" />
                <div>
                  <h3>Audit Record: {selectedLog.id}</h3>
                  <p className="modal-subtitle-text">
                    {selectedLog.action} · Logged at {formatDate(selectedLog.timestamp)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setSelectedLog(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="detail-section">
                <span className="detail-section-title">Audit Metadata</span>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Administrator</span>
                    <span className="detail-val">
                      {selectedLog.adminName} (<code>{selectedLog.adminId}</code>)
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Target Entity</span>
                    <span className="detail-val">
                      {selectedLog.entityType} · <code>{selectedLog.entityId}</code>
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Operation Description</span>
                    <span className="detail-val">{selectedLog.description}</span>
                  </div>
                  {selectedLog.reason && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Administrative Justification / Reason</span>
                      <span className="detail-val highlight-reason">{selectedLog.reason}</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div className="detail-section">
                  <span className="detail-section-title">State Mutation Diff</span>
                  <div className="diff-grid">
                    <div className="diff-box old-box">
                      <span className="diff-label">Previous State (Old Value)</span>
                      <pre>
                        {typeof selectedLog.oldValue === 'object'
                          ? JSON.stringify(selectedLog.oldValue, null, 2)
                          : selectedLog.oldValue || '— (None / Initial Creation)'}
                      </pre>
                    </div>

                    <div className="diff-box new-box">
                      <span className="diff-label">New State (New Value)</span>
                      <pre>
                        {typeof selectedLog.newValue === 'object'
                          ? JSON.stringify(selectedLog.newValue, null, 2)
                          : selectedLog.newValue || '—'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedLog(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
