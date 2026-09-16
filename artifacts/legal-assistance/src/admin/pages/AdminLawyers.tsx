import React, { useState, useMemo } from 'react';
import {
  Scale,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Ban,
  RotateCcw,
  UserX,
  X,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Briefcase,
  MapPin,
  ExternalLink,
  Award,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminDataTable, Column } from '../components/AdminDataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ReasonModal } from '../components/ReasonModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import type {
  AdminLawyerProfile,
  VerificationStatus,
  AccountStatus,
  VerificationDocument,
} from '../types';

export const AdminLawyers: React.FC = () => {
  const {
    lawyers,
    approveLawyer,
    rejectLawyer,
    suspendLawyer,
    restoreLawyer,
    deactivateLawyer,
    settings,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | 'ALL'>('ALL');
  const [accountFilter, setAccountFilter] = useState<AccountStatus | 'ALL'>('ALL');
  const [specializationFilter, setSpecializationFilter] = useState<string>('ALL');

  // Selected lawyer for drawer view
  const [selectedLawyer, setSelectedLawyer] = useState<AdminLawyerProfile | null>(null);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);

  // Action Modals
  const [lawyerToApprove, setLawyerToApprove] = useState<AdminLawyerProfile | null>(null);
  const [lawyerToReject, setLawyerToReject] = useState<AdminLawyerProfile | null>(null);
  const [lawyerToSuspend, setLawyerToSuspend] = useState<AdminLawyerProfile | null>(null);
  const [lawyerToDeactivate, setLawyerToDeactivate] = useState<AdminLawyerProfile | null>(null);
  const [lawyerToRestore, setLawyerToRestore] = useState<AdminLawyerProfile | null>(null);

  const pendingLawyers = useMemo(
    () => lawyers.filter((l) => l.verificationStatus === 'PENDING'),
    [lawyers]
  );

  const pendingCount = pendingLawyers.length;

  // Filtered dataset
  const filteredLawyers = useMemo(() => {
    return lawyers.filter((l) => {
      if (activeTab === 'pending' && l.verificationStatus !== 'PENDING') {
        return false;
      }
      if (activeTab === 'all') {
        if (verificationFilter !== 'ALL' && l.verificationStatus !== verificationFilter) {
          return false;
        }
        if (accountFilter !== 'ALL' && l.accountStatus !== accountFilter) {
          return false;
        }
      }
      if (specializationFilter !== 'ALL' && l.specialization !== specializationFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mId = l.id.toLowerCase().includes(q);
        const mName = l.name.toLowerCase().includes(q);
        const mEmail = l.email.toLowerCase().includes(q);
        const mReg = l.registrationNumber.toLowerCase().includes(q);
        const mPhone = l.phone.toLowerCase().includes(q);
        if (!mId && !mName && !mEmail && !mReg && !mPhone) return false;
      }
      return true;
    });
  }, [lawyers, activeTab, verificationFilter, accountFilter, specializationFilter, search]);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const columns: Column<AdminLawyerProfile>[] = [
    {
      header: 'Lawyer ID',
      accessor: (l) => <code className="admin-mono-id">{l.id}</code>,
      width: '100px',
    },
    {
      header: 'Advocate & Credentials',
      accessor: (l) => (
        <div className="table-user-cell">
          <div className="table-avatar gold">{l.name.replace('Adv.', '').trim().slice(0, 2).toUpperCase()}</div>
          <div className="table-user-info">
            <strong className="user-name">{l.name}</strong>
            <span className="user-reg">
              Bar Reg: <code>{l.registrationNumber}</code>
            </span>
            <small className="user-email">{l.email}</small>
          </div>
        </div>
      ),
    },
    {
      header: 'Specialization',
      accessor: (l) => (
        <div>
          <strong>{l.specialization}</strong>
          <div className="experience-sub" style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
            {l.experienceYears} yrs experience
          </div>
        </div>
      ),
      width: '180px',
    },
    {
      header: 'Verification Status',
      accessor: (l) => <StatusBadge status={l.verificationStatus} type="verification" />,
      width: '160px',
    },
    {
      header: 'Account Status',
      accessor: (l) => <StatusBadge status={l.accountStatus} type="account" />,
      width: '150px',
    },
    {
      header: 'Actions',
      accessor: (l) => (
        <div className="table-action-group" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="admin-icon-btn"
            title="Review Full Dossier"
            onClick={() => setSelectedLawyer(l)}
          >
            <Eye size={15} />
          </button>

          {l.verificationStatus === 'PENDING' && (
            <>
              <button
                type="button"
                className="admin-icon-btn text-success"
                title="Approve Advocate Credentials"
                onClick={() => setLawyerToApprove(l)}
              >
                <CheckCircle2 size={15} />
              </button>
              <button
                type="button"
                className="admin-icon-btn text-danger"
                title="Reject Verification"
                onClick={() => setLawyerToReject(l)}
              >
                <XCircle size={15} />
              </button>
            </>
          )}

          {l.accountStatus === 'ACTIVE' && l.verificationStatus === 'APPROVED' && (
            <button
              type="button"
              className="admin-icon-btn text-warning"
              title="Suspend Advocate"
              onClick={() => setLawyerToSuspend(l)}
            >
              <Ban size={15} />
            </button>
          )}

          {l.accountStatus === 'SUSPENDED' && (
            <button
              type="button"
              className="admin-icon-btn text-success"
              title="Restore Account"
              onClick={() => setLawyerToRestore(l)}
            >
              <RotateCcw size={15} />
            </button>
          )}

          {l.accountStatus !== 'DEACTIVATED' && (
            <button
              type="button"
              className="admin-icon-btn text-danger"
              title="Deactivate / Soft Delete"
              onClick={() => setLawyerToDeactivate(l)}
            >
              <UserX size={15} />
            </button>
          )}
        </div>
      ),
      width: '190px',
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">BAR COUNCIL & ADVOCATE DIRECTORY</div>
          <h1 className="admin-page-title">Advocate Verification & Directory</h1>
          <p className="admin-page-desc">
            Verify state bar council enrollments, audit practice credentials, manage verification queues, and enforce professional standards.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Scale size={16} /> All Registered Advocates ({lawyers.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FileCheck size={16} /> Pending Verification Queue{' '}
          {pendingCount > 0 && <span className="tab-badge warning">{pendingCount}</span>}
        </button>
      </div>

      {/* Pending Triage Hero Cards when on Pending Tab */}
      {activeTab === 'pending' && pendingLawyers.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <span className="section-kicker">ACTIONABLE VERIFICATION DOSSIERS ({pendingLawyers.length})</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {pendingLawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="settings-card"
                style={{ borderLeft: '4px solid var(--admin-warning)', cursor: 'pointer' }}
                onClick={() => setSelectedLawyer(lawyer)}
              >
                <div className="settings-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="title-with-icon">
                    <div className="table-avatar gold">{lawyer.name.replace('Adv.', '').trim().slice(0, 2)}</div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem' }}>{lawyer.name}</h3>
                      <p className="modal-subtitle-text">ID: {lawyer.id} · {lawyer.specialization}</p>
                    </div>
                  </div>
                  <StatusBadge status="PENDING" type="verification" />
                </div>

                <div className="settings-card-body" style={{ gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--admin-text-secondary)' }}>Bar Registration:</span>
                    <strong><code>{lawyer.registrationNumber}</code></strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--admin-text-secondary)' }}>Experience:</span>
                    <strong>{lawyer.experienceYears} Years</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--admin-text-secondary)' }}>Uploaded Documents:</span>
                    <strong>{lawyer.documents.length} Files Attached</strong>
                  </div>

                  {lawyer.documents.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {lawyer.documents.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          className="spec-tag"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDoc(doc);
                          }}
                        >
                          <FileText size={12} /> {doc.title}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border-subtle)' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger compact"
                      style={{ flex: 1 }}
                      onClick={() => setLawyerToReject(lawyer)}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary compact"
                      style={{ flex: 1 }}
                      onClick={() => setLawyerToApprove(lawyer)}
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table */}
      <AdminDataTable
        data={filteredLawyers}
        columns={columns}
        keyExtractor={(l) => l.id}
        searchPlaceholder="Search by ID, name, bar registration number, email..."
        searchValue={search}
        onSearchChange={setSearch}
        onRowClick={(l) => setSelectedLawyer(l)}
        extraFilters={
          <>
            {activeTab === 'all' && (
              <>
                <select
                  value={verificationFilter}
                  onChange={(e) =>
                    setVerificationFilter(e.target.value as VerificationStatus | 'ALL')
                  }
                  className="admin-select compact"
                >
                  <option value="ALL">All Verifications</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <select
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value as AccountStatus | 'ALL')}
                  className="admin-select compact"
                >
                  <option value="ALL">All Account States</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="DEACTIVATED">Deactivated</option>
                </select>
              </>
            )}

            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="admin-select compact"
            >
              <option value="ALL">All Specializations</option>
              {settings.lawyers.specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </>
        }
        emptyTitle="No advocates found"
        emptyDescription="Try selecting another tab or adjusting your filter criteria."
      />

      {/* Lawyer Detail & Verification Drawer */}
      {selectedLawyer && (
        <div className="admin-drawer-overlay" onClick={() => setSelectedLawyer(null)}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="title-with-icon">
                <div className="table-avatar gold large">
                  {selectedLawyer.name.replace('Adv.', '').trim().slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedLawyer.name}</h3>
                  <p className="modal-subtitle-text">
                    ID: {selectedLawyer.id} · Bar Reg: {selectedLawyer.registrationNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setSelectedLawyer(null)}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Dual Badges Display */}
              <div className="dual-status-grid">
                <div className="status-cell">
                  <span className="label">Verification Status:</span>
                  <StatusBadge status={selectedLawyer.verificationStatus} type="verification" />
                </div>
                <div className="status-cell">
                  <span className="label">Account Status:</span>
                  <StatusBadge status={selectedLawyer.accountStatus} type="account" />
                </div>
              </div>

              {/* Rejection / Suspension Notice */}
              {selectedLawyer.verificationStatus === 'REJECTED' && selectedLawyer.rejectionReason && (
                <div className="admin-alert-box alert-danger">
                  <AlertTriangle size={16} />
                  <div>
                    <strong>Verification Rejection Reason:</strong>
                    <p>{selectedLawyer.rejectionReason}</p>
                  </div>
                </div>
              )}

              {selectedLawyer.accountStatus === 'SUSPENDED' && selectedLawyer.suspensionReason && (
                <div className="admin-alert-box alert-warning">
                  <Ban size={16} />
                  <div>
                    <strong>Suspension Reason:</strong>
                    <p>{selectedLawyer.suspensionReason}</p>
                  </div>
                </div>
              )}

              {/* Professional Credentials Section */}
              <div className="detail-section">
                <span className="detail-section-title">Bar Council & Practice Details</span>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Bar Registration No.</span>
                    <span className="detail-val">
                      <code>{selectedLawyer.registrationNumber}</code>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Legal Specialization</span>
                    <span className="detail-val">{selectedLawyer.specialization}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Years of Experience</span>
                    <span className="detail-val">{selectedLawyer.experienceYears} Years</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Verified By</span>
                    <span className="detail-val">{selectedLawyer.verifiedBy || 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Personal & Chamber Details */}
              <div className="detail-section">
                <span className="detail-section-title">Contact & Chamber Location</span>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-val">{selectedLawyer.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone Number</span>
                    <span className="detail-val">{selectedLawyer.phone}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Chamber Address</span>
                    <span className="detail-val">{selectedLawyer.address}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedLawyer.bio && (
                <div className="detail-section">
                  <span className="detail-section-title">Professional Summary</span>
                  <p className="bio-text">{selectedLawyer.bio}</p>
                </div>
              )}

              {/* Verification Documents */}
              <div className="detail-section">
                <span className="detail-section-title">
                  Submitted Verification Documents ({selectedLawyer.documents.length})
                </span>
                {selectedLawyer.documents.length === 0 ? (
                  <p className="field-hint">No credentials uploaded yet.</p>
                ) : (
                  <div className="document-list">
                    {selectedLawyer.documents.map((doc) => (
                      <div key={doc.id} className="doc-tile">
                        <div className="doc-leading">
                          <FileText size={20} className="text-primary" />
                        </div>
                        <div className="doc-info">
                          <strong>{doc.title}</strong>
                          <span>
                            {doc.fileName} · {doc.fileSize}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary compact"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <Eye size={14} /> Preview
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="drawer-footer">
              {selectedLawyer.verificationStatus === 'PENDING' && (
                <>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      setLawyerToReject(selectedLawyer);
                      setSelectedLawyer(null);
                    }}
                  >
                    <XCircle size={16} /> Reject Verification
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => {
                      setLawyerToApprove(selectedLawyer);
                      setSelectedLawyer(null);
                    }}
                  >
                    <CheckCircle2 size={16} /> Approve Advocate
                  </button>
                </>
              )}

              {selectedLawyer.verificationStatus === 'APPROVED' && selectedLawyer.accountStatus === 'ACTIVE' && (
                <button
                  type="button"
                  className="admin-btn admin-btn-warning"
                  onClick={() => {
                    setLawyerToSuspend(selectedLawyer);
                    setSelectedLawyer(null);
                  }}
                >
                  <Ban size={15} /> Suspend Account
                </button>
              )}

              {selectedLawyer.accountStatus === 'SUSPENDED' && (
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    setLawyerToRestore(selectedLawyer);
                    setSelectedLawyer(null);
                  }}
                >
                  <RotateCcw size={15} /> Restore Account
                </button>
              )}

              {selectedLawyer.accountStatus !== 'DEACTIVATED' && (
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={() => {
                    setLawyerToDeactivate(selectedLawyer);
                    setSelectedLawyer(null);
                  }}
                >
                  <UserX size={15} /> Soft-Delete (Deactivate)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        document={previewDoc}
        lawyerName={selectedLawyer?.name || 'Advocate'}
        onClose={() => setPreviewDoc(null)}
      />

      {/* Approve Lawyer Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(lawyerToApprove)}
        title="Approve Advocate Credentials"
        message={`Are you sure you want to approve ${lawyerToApprove?.name}? This will grant them verified advocate status and allow them to take client consultations.`}
        confirmLabel="Confirm Approval"
        tone="success"
        details={
          <div>
            <strong>Bar Reg:</strong> <code>{lawyerToApprove?.registrationNumber}</code>
            <br />
            <strong>Specialization:</strong> {lawyerToApprove?.specialization}
          </div>
        }
        onConfirm={() => {
          if (lawyerToApprove) approveLawyer(lawyerToApprove.id);
          setLawyerToApprove(null);
        }}
        onClose={() => setLawyerToApprove(null)}
      />

      {/* Reject Lawyer Modal with Mandatory Reason */}
      <ReasonModal
        isOpen={Boolean(lawyerToReject)}
        title="Reject Lawyer Verification"
        subtitle="Mandatory justification required for compliance record"
        entityName={lawyerToReject?.name || ''}
        entityId={lawyerToReject?.id || ''}
        actionType="REJECT"
        reasonPlaceholder="e.g. Bar council registration number could not be authenticated in state records..."
        warningNote="The advocate will be notified with this reason and will be required to re-upload valid credentials."
        confirmLabel="Reject Verification"
        onConfirm={(reason) => {
          if (lawyerToReject) rejectLawyer(lawyerToReject.id, reason);
          setLawyerToReject(null);
        }}
        onClose={() => setLawyerToReject(null)}
      />

      {/* Suspend Lawyer Modal with Mandatory Reason */}
      <ReasonModal
        isOpen={Boolean(lawyerToSuspend)}
        title="Suspend Advocate Account"
        subtitle="Temporary restriction from platform access"
        entityName={lawyerToSuspend?.name || ''}
        entityId={lawyerToSuspend?.id || ''}
        actionType="SUSPEND"
        reasonPlaceholder="Specify the complaint or violation justifying suspension..."
        warningNote="Suspended lawyers cannot accept appointments, message clients, or access case files."
        confirmLabel="Suspend Advocate"
        onConfirm={(reason) => {
          if (lawyerToSuspend) suspendLawyer(lawyerToSuspend.id, reason);
          setLawyerToSuspend(null);
        }}
        onClose={() => setLawyerToSuspend(null)}
      />

      {/* Deactivate Lawyer Modal */}
      <ReasonModal
        isOpen={Boolean(lawyerToDeactivate)}
        title="Deactivate Advocate Account (Soft Delete)"
        subtitle="Disabled state with permanent historical records"
        entityName={lawyerToDeactivate?.name || ''}
        entityId={lawyerToDeactivate?.id || ''}
        actionType="DEACTIVATE"
        reasonPlaceholder="Specify reason for account deactivation..."
        warningNote="Soft-deleted advocates cannot log in. Historical case associations and receipts are preserved."
        confirmLabel="Deactivate Account"
        onConfirm={(reason) => {
          if (lawyerToDeactivate) deactivateLawyer(lawyerToDeactivate.id, reason);
          setLawyerToDeactivate(null);
        }}
        onClose={() => setLawyerToDeactivate(null)}
      />

      {/* Restore Modal */}
      <ConfirmModal
        isOpen={Boolean(lawyerToRestore)}
        title="Restore Advocate Account"
        message={`Are you sure you want to restore active status for ${lawyerToRestore?.name}?`}
        confirmLabel="Restore to Active"
        tone="success"
        onConfirm={() => {
          if (lawyerToRestore) restoreLawyer(lawyerToRestore.id);
          setLawyerToRestore(null);
        }}
        onClose={() => setLawyerToRestore(null)}
      />
    </div>
  );
};
