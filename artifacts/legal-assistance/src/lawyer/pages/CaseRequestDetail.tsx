import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import {
  ArrowLeft, User, FileText, Check, X, MessageSquareText, Eye, Download,
  ShieldCheck, MapPin, Calendar, Phone, Mail, AlertTriangle, ChevronRight,
  Image, File, Scale, Clock,
} from 'lucide-react';
import type { CaseDocument } from '../types';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const REJECT_REASONS = [
  'Outside my practice area',
  'Conflict of interest',
  'Availability issue',
  'Location issue',
  'Insufficient information',
  'Already representing opposite party',
  'Other',
];

export function CaseRequestDetail({
  requestId,
  onBack,
  onCaseAccepted,
}: {
  requestId: string;
  onBack: () => void;
  onCaseAccepted: (caseId: string) => void;
}) {
  const { caseRequests, acceptCaseRequest, rejectCaseRequest, requestMoreInfo } = useLawyer();
  const req = caseRequests.find(r => r.requestId === requestId);

  const [activeTab, setActiveTab] = useState<'case' | 'client' | 'documents'>('case');
  const [action, setAction] = useState<'none' | 'accept' | 'reject' | 'info'>('none');
  const [conflictConfirmed, setConflictConfirmed] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [rejectNote, setRejectNote] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [previewDoc, setPreviewDoc] = useState<CaseDocument | null>(null);

  if (!req) {
    return (
      <div className="lp-page">
        <button className="lp-back-btn" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <p>Case request not found.</p>
      </div>
    );
  }

  const isDecided = req.status === 'ACCEPTED' || req.status === 'REJECTED';

  const handleAccept = () => {
    acceptCaseRequest(req.requestId, conflictConfirmed);
    onCaseAccepted(req.caseId);
  };

  const handleReject = () => {
    const reason = rejectReason === 'Other' ? rejectNote || 'Other' : rejectReason;
    rejectCaseRequest(req.requestId, reason);
    setAction('none');
  };

  const handleInfo = () => {
    if (!infoMessage.trim()) return;
    requestMoreInfo(req.requestId, infoMessage.trim());
    setInfoMessage('');
    setAction('none');
  };

  return (
    <div className="lp-page">
      {/* Back Button */}
      <button className="lp-back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Case Requests
      </button>

      {/* Header */}
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / CASE REQUEST REVIEW</span>
          <h1>{req.caseTitle}</h1>
          <p>
            <code className="lp-mono">{req.requestId}</code> &nbsp;·&nbsp;
            Submitted {formatDate(req.requestedAt)} by {req.client.name}
          </p>
        </div>
        <div className="lp-header-status">
          <span className={cx(
            'lp-pill lp-pill-lg',
            req.status === 'PENDING' ? 'lp-pill-gold'
              : req.status === 'INFO_REQUESTED' ? 'lp-pill-teal'
              : req.status === 'ACCEPTED' ? 'lp-pill-green'
              : 'lp-pill-neutral'
          )}>
            {req.status === 'PENDING' ? 'New Request'
              : req.status === 'INFO_REQUESTED' ? 'Info Requested'
              : req.status === 'ACCEPTED' ? 'Accepted'
              : 'Rejected'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="lp-tabs">
        {(['case', 'client', 'documents'] as const).map(t => (
          <button key={t} className={cx('lp-tab', activeTab === t && 'lp-tab-active')} onClick={() => setActiveTab(t)}>
            {t === 'case' ? 'Case Information' : t === 'client' ? 'Client Details' : `Documents (${req.documents.length})`}
          </button>
        ))}
      </div>

      <div className="lp-request-detail-grid">
        {/* Main Content */}
        <div className="lp-request-detail-main">
          {activeTab === 'case' && (
            <div className="lp-card">
              <span className="lp-section-kicker">CASE DETAILS</span>
              <div className="lp-detail-grid">
                <div className="lp-detail-field">
                  <label>Case Category</label>
                  <span className="lp-pill lp-pill-navy">{req.caseCategory}</span>
                </div>
                <div className="lp-detail-field">
                  <label>Opposite Party</label>
                  <span>{req.oppositeParty}</span>
                </div>
                <div className="lp-detail-field">
                  <label>Location / Jurisdiction</label>
                  <span><MapPin size={14} /> {req.location}</span>
                </div>
                <div className="lp-detail-field">
                  <label>Relevant Dates</label>
                  <span><Calendar size={14} /> {req.relevantDates}</span>
                </div>
                <div className="lp-detail-field">
                  <label>Preferred Consultation</label>
                  <span>{req.preferredConsultation === 'VIDEO' ? '🎥 Video Consultation' : '🏢 Office Visit'}</span>
                </div>
              </div>
              <div className="lp-detail-field lp-detail-full">
                <label>Case Description</label>
                <p className="lp-description-text">{req.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'client' && (
            <div className="lp-card">
              <span className="lp-section-kicker">CLIENT INFORMATION</span>
              <div className="lp-client-profile">
                <div className="lp-client-avatar">
                  {req.client.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h3>{req.client.name}</h3>
                  <span className="lp-muted">Client ID: {req.client.clientId}</span>
                </div>
              </div>
              <div className="lp-detail-grid">
                <div className="lp-detail-field">
                  <label><Mail size={14} /> Email</label>
                  <span>{req.client.email}</span>
                </div>
                <div className="lp-detail-field">
                  <label><Phone size={14} /> Phone</label>
                  <span>{req.client.phone}</span>
                </div>
                <div className="lp-detail-field">
                  <label><MapPin size={14} /> Location</label>
                  <span>{req.client.location}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="lp-card">
              <span className="lp-section-kicker">UPLOADED DOCUMENTS</span>
              {req.documents.length === 0 ? (
                <div className="lp-empty"><FileText size={24} /><p>No documents uploaded yet.</p></div>
              ) : (
                <div className="lp-doc-list">
                  {req.documents.map(doc => (
                    <div key={doc.docId} className="lp-doc-row">
                      <div className="lp-doc-icon">
                        {doc.fileType === 'IMAGE' ? <Image size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="lp-doc-info">
                        <strong>{doc.name}</strong>
                        <span>{doc.fileType} &nbsp;·&nbsp; {doc.fileSize} &nbsp;·&nbsp; {formatDate(doc.uploadedAt)}</span>
                        <span className="lp-muted">Uploaded by {doc.uploadedByName}</span>
                      </div>
                      <div className="lp-doc-actions">
                        <button className="lp-icon-btn" title="Preview" onClick={() => setPreviewDoc(doc)}>
                          <Eye size={16} />
                        </button>
                        <button className="lp-icon-btn" title="Download">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info Requests History */}
          {req.infoRequests.length > 0 && (
            <div className="lp-card">
              <span className="lp-section-kicker">INFORMATION REQUESTS</span>
              <div className="lp-info-timeline">
                {req.infoRequests.map(ir => (
                  <div key={ir.id} className="lp-info-thread">
                    <div className="lp-chat-bubble lp-chat-lawyer">
                      <strong>You (Lawyer)</strong>
                      <p>{ir.message}</p>
                      <small>{formatDate(ir.sentAt)}</small>
                    </div>
                    {ir.clientResponse && (
                      <div className="lp-chat-bubble lp-chat-client">
                        <strong>{req.client.name}</strong>
                        <p>{ir.clientResponse}</p>
                        <small>{ir.respondedAt ? formatDate(ir.respondedAt) : ''}</small>
                      </div>
                    )}
                    {!ir.clientResponse && (
                      <div className="lp-awaiting-banner">
                        <Clock size={13} /> Awaiting client response…
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="lp-request-detail-sidebar">
          {!isDecided ? (
            <div className="lp-card lp-action-card">
              <span className="lp-section-kicker">TAKE ACTION</span>
              <h3>Review this case</h3>
              <p className="lp-muted">Review all case information and documents before making a decision.</p>

              {action === 'none' && (
                <div className="lp-action-buttons">
                  <button className="lp-btn lp-btn-primary lp-btn-full" onClick={() => setAction('accept')}>
                    <Check size={16} /> Accept Case
                  </button>
                  <button className="lp-btn lp-btn-danger lp-btn-full" onClick={() => setAction('reject')}>
                    <X size={16} /> Reject Case
                  </button>
                  <button className="lp-btn lp-btn-secondary lp-btn-full" onClick={() => setAction('info')}>
                    <MessageSquareText size={16} /> Request More Information
                  </button>
                </div>
              )}

              {action === 'accept' && (
                <div className="lp-action-form">
                  <div className="lp-conflict-check">
                    <ShieldCheck size={18} />
                    <h4>Conflict of Interest Declaration</h4>
                    <p>Please confirm before accepting this case.</p>
                    <label className="lp-checkbox-label">
                      <input
                        type="checkbox"
                        checked={conflictConfirmed}
                        onChange={e => setConflictConfirmed(e.target.checked)}
                      />
                      I have reviewed the case and have no known conflict of interest with any party involved.
                    </label>
                  </div>
                  <div className="lp-action-footer">
                    <button className="lp-btn lp-btn-secondary" onClick={() => setAction('none')}>Cancel</button>
                    <button
                      className="lp-btn lp-btn-primary"
                      disabled={!conflictConfirmed}
                      onClick={handleAccept}
                    >
                      <Check size={15} /> Confirm Accept
                    </button>
                  </div>
                </div>
              )}

              {action === 'reject' && (
                <div className="lp-action-form">
                  <h4>Rejection Reason</h4>
                  <select
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="lp-select"
                  >
                    {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {rejectReason === 'Other' && (
                    <textarea
                      value={rejectNote}
                      onChange={e => setRejectNote(e.target.value)}
                      placeholder="Please specify the reason..."
                      rows={3}
                      className="lp-textarea"
                    />
                  )}
                  <div className="lp-action-footer">
                    <button className="lp-btn lp-btn-secondary" onClick={() => setAction('none')}>Cancel</button>
                    <button className="lp-btn lp-btn-danger" onClick={handleReject}>
                      <X size={15} /> Confirm Reject
                    </button>
                  </div>
                </div>
              )}

              {action === 'info' && (
                <div className="lp-action-form">
                  <h4>Request Additional Information</h4>
                  <p className="lp-muted">Describe what documents or information you need from the client.</p>
                  <textarea
                    value={infoMessage}
                    onChange={e => setInfoMessage(e.target.value)}
                    placeholder="e.g. Please upload the FIR copy and previous court notice..."
                    rows={4}
                    className="lp-textarea"
                  />
                  <div className="lp-action-footer">
                    <button className="lp-btn lp-btn-secondary" onClick={() => setAction('none')}>Cancel</button>
                    <button
                      className="lp-btn lp-btn-primary"
                      disabled={!infoMessage.trim()}
                      onClick={handleInfo}
                    >
                      <MessageSquareText size={15} /> Send Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="lp-card lp-action-card">
              <span className="lp-section-kicker">DECISION</span>
              <div className={cx('lp-decision-badge', req.status === 'ACCEPTED' ? 'lp-decision-accept' : 'lp-decision-reject')}>
                {req.status === 'ACCEPTED' ? <Check size={24} /> : <X size={24} />}
                <strong>{req.status === 'ACCEPTED' ? 'Case Accepted' : 'Case Rejected'}</strong>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="lp-card">
            <span className="lp-section-kicker">QUICK SUMMARY</span>
            <div className="lp-quick-stats">
              <div><span>Documents</span><strong>{req.documents.length}</strong></div>
              <div><span>Info Requests</span><strong>{req.infoRequests.length}</strong></div>
              <div><span>Consultation</span><strong>{req.preferredConsultation === 'VIDEO' ? 'Video' : 'Office'}</strong></div>
              <div><span>Category</span><strong>{req.caseCategory}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="lp-modal-backdrop" onClick={() => setPreviewDoc(null)}>
          <div className="lp-modal lp-doc-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <h3>{previewDoc.name}</h3>
              <button className="lp-icon-btn" onClick={() => setPreviewDoc(null)}><X size={18} /></button>
            </div>
            <div className="lp-doc-preview">
              {previewDoc.fileType === 'IMAGE' && previewDoc.url ? (
                <img src={previewDoc.url} alt={previewDoc.name} className="lp-doc-preview-img" />
              ) : (
                <div className="lp-doc-preview-placeholder">
                  <FileText size={48} />
                  <p>{previewDoc.fileName}</p>
                  <p className="lp-muted">{previewDoc.fileSize}</p>
                  <button className="lp-btn lp-btn-primary">
                    <Download size={16} /> Download to View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
