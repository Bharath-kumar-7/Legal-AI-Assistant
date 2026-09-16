import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import {
  ArrowLeft, FileText, MessageSquareText, Calendar, CreditCard, Clock,
  Upload, Download, Eye, Trash2, PenLine, Plus, Send, X, CheckCircle2,
  Image, File, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { CaseStatus, CaseDocument, LawyerNote } from '../types';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_SEQUENCE: CaseStatus[] = [
  'ASSIGNED', 'CONSULTATION_SCHEDULED', 'DOCUMENTS_PENDING',
  'UNDER_REVIEW', 'LEGAL_NOTICE', 'COURT_FILING', 'HEARING', 'RESOLVED', 'CLOSED',
];
const STATUS_LABEL: Record<string, string> = {
  ASSIGNED: 'Assigned',
  CONSULTATION_SCHEDULED: 'Consultation Scheduled',
  DOCUMENTS_PENDING: 'Documents Pending',
  UNDER_REVIEW: 'Under Review',
  LEGAL_NOTICE: 'Legal Notice',
  COURT_FILING: 'Court Filing',
  HEARING: 'Hearing',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};
const STATUS_PILL: Record<string, string> = {
  ASSIGNED: 'lp-pill-teal',
  CONSULTATION_SCHEDULED: 'lp-pill-teal',
  DOCUMENTS_PENDING: 'lp-pill-gold',
  UNDER_REVIEW: 'lp-pill-gold',
  LEGAL_NOTICE: 'lp-pill-navy',
  COURT_FILING: 'lp-pill-navy',
  HEARING: 'lp-pill-navy',
  RESOLVED: 'lp-pill-green',
  CLOSED: 'lp-pill-neutral',
};

type TabId = 'overview' | 'documents' | 'notes' | 'chat' | 'appointments' | 'payments' | 'status';

export function CaseDetail({ caseId, onBack }: { caseId: string; onBack: () => void }) {
  const {
    cases, profile, updateCaseStatus, uploadDocument, deleteDocument,
    addNote, updateNote, deleteNote, sendMessage,
  } = useLawyer();

  const c = cases.find(x => x.caseId === caseId);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Status update state
  const [newStatus, setNewStatus] = useState<CaseStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [showStatusForm, setShowStatusForm] = useState(false);

  // Document upload state
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [docForm, setDocForm] = useState({ name: '', fileType: 'PDF', fileSize: '1 MB', category: 'LAWYER_DOCUMENT' as CaseDocument['category'], description: '' });

  // Notes state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<LawyerNote | null>(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });

  // Chat state
  const [chatText, setChatText] = useState('');

  if (!c) {
    return (
      <div className="lp-page">
        <button className="lp-back-btn" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <p>Case not found.</p>
      </div>
    );
  }

  const handleStatusUpdate = () => {
    if (!newStatus) return;
    updateCaseStatus(c.caseId, newStatus, statusNote);
    setShowStatusForm(false);
    setNewStatus('');
    setStatusNote('');
  };

  const handleUploadDoc = () => {
    if (!docForm.name) return;
    uploadDocument(c.caseId, {
      caseId: c.caseId,
      name: docForm.name,
      fileName: `${docForm.name.replace(/\s+/g, '_')}.${docForm.fileType.toLowerCase()}`,
      fileType: docForm.fileType,
      fileSize: docForm.fileSize,
      category: docForm.category,
      uploadedBy: 'LAWYER',
      uploadedByName: profile.fullName,
      description: docForm.description,
    });
    setShowDocUpload(false);
    setDocForm({ name: '', fileType: 'PDF', fileSize: '1 MB', category: 'LAWYER_DOCUMENT', description: '' });
  };

  const handleSaveNote = () => {
    if (!noteForm.title || !noteForm.content) return;
    if (editingNote) {
      updateNote(c.caseId, editingNote.noteId, noteForm);
    } else {
      addNote(c.caseId, { ...noteForm, lawyerId: profile.userId });
    }
    setShowNoteForm(false);
    setEditingNote(null);
    setNoteForm({ title: '', content: '' });
  };

  const handleSendMessage = () => {
    if (!chatText.trim()) return;
    sendMessage(c.caseId, chatText.trim());
    setChatText('');
  };

  const clientDocs = c.documents.filter(d => d.uploadedBy === 'CLIENT');
  const lawyerDocs = c.documents.filter(d => d.uploadedBy === 'LAWYER');
  const courtDocs = c.documents.filter(d => d.uploadedBy === 'COURT');

  return (
    <div className="lp-page">
      <button className="lp-back-btn" onClick={onBack}><ArrowLeft size={16} /> Back to My Cases</button>

      {/* Header */}
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / CASE DETAIL</span>
          <h1>{c.caseTitle}</h1>
          <p>
            <code className="lp-mono">{c.caseId}</code> &nbsp;·&nbsp;
            {c.client.name} &nbsp;·&nbsp; {c.caseCategory}
          </p>
        </div>
        <span className={cx('lp-pill lp-pill-lg', STATUS_PILL[c.currentStatus])}>
          {STATUS_LABEL[c.currentStatus]}
        </span>
      </div>

      {/* Tabs */}
      <div className="lp-tabs lp-tabs-scroll">
        {(['overview', 'documents', 'notes', 'chat', 'appointments', 'payments', 'status'] as TabId[]).map(t => (
          <button key={t} className={cx('lp-tab', activeTab === t && 'lp-tab-active')} onClick={() => setActiveTab(t)}>
            {t === 'overview' ? 'Overview'
              : t === 'documents' ? `Documents (${c.documents.length})`
              : t === 'notes' ? `Notes (${c.notes.length})`
              : t === 'chat' ? `Chat (${c.messages.length})`
              : t === 'appointments' ? `Appointments (${c.appointments.length})`
              : t === 'payments' ? `Payments (${c.payments.length})`
              : 'Status'}
          </button>
        ))}
      </div>

      {/* ─── Overview ─── */}
      {activeTab === 'overview' && (
        <div className="lp-case-detail-grid">
          <div className="lp-card">
            <span className="lp-section-kicker">CASE OVERVIEW</span>
            <div className="lp-detail-grid">
              <div className="lp-detail-field"><label>Case ID</label><code className="lp-mono">{c.caseId}</code></div>
              <div className="lp-detail-field"><label>Category</label><span className="lp-pill lp-pill-navy">{c.caseCategory}</span></div>
              <div className="lp-detail-field"><label>Client</label><span>{c.client.name}</span></div>
              <div className="lp-detail-field"><label>Opposite Party</label><span>{c.oppositeParty}</span></div>
              <div className="lp-detail-field"><label>Location</label><span>{c.location}</span></div>
              <div className="lp-detail-field"><label>Assigned</label><span>{formatDate(c.assignedAt)}</span></div>
              <div className="lp-detail-field"><label>Last Updated</label><span>{formatDate(c.lastUpdatedAt)}</span></div>
              {c.closedAt && <div className="lp-detail-field"><label>Closed</label><span>{formatDate(c.closedAt)}</span></div>}
            </div>
            <div className="lp-detail-field lp-detail-full">
              <label>Description</label>
              <p className="lp-description-text">{c.description}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="lp-card">
            <span className="lp-section-kicker">CASE TIMELINE</span>
            <div className="lp-timeline">
              {c.statusHistory.map((h, i) => (
                <div key={h.id} className="lp-timeline-item">
                  <div className="lp-timeline-dot lp-dot-done"><CheckCircle2 size={14} /></div>
                  <div className="lp-timeline-content">
                    <strong>{STATUS_LABEL[h.newStatus]}</strong>
                    {h.note && <p>{h.note}</p>}
                    <small>{formatDateTime(h.changedAt)}</small>
                  </div>
                </div>
              ))}
              <div className="lp-timeline-item lp-timeline-current">
                <div className="lp-timeline-dot lp-dot-current" />
                <div className="lp-timeline-content">
                  <strong>{STATUS_LABEL[c.currentStatus]} (Current)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Documents ─── */}
      {activeTab === 'documents' && (
        <div className="lp-card">
          <div className="lp-card-header">
            <span className="lp-section-kicker">DOCUMENT VAULT</span>
            <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={() => setShowDocUpload(true)}>
              <Upload size={15} /> Upload Document
            </button>
          </div>

          {showDocUpload && (
            <div className="lp-inline-form">
              <h4>Upload Document</h4>
              <div className="lp-form-row">
                <label>Document Name<input value={docForm.name} onChange={e => setDocForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Legal Notice" /></label>
                <label>File Type
                  <select value={docForm.fileType} onChange={e => setDocForm(f => ({ ...f, fileType: e.target.value }))} className="lp-select">
                    {['PDF', 'DOCX', 'IMAGE', 'OTHER'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label>Category
                  <select value={docForm.category} onChange={e => setDocForm(f => ({ ...f, category: e.target.value as CaseDocument['category'] }))} className="lp-select">
                    <option value="LAWYER_DOCUMENT">Lawyer Document</option>
                    <option value="NOTICE">Notice</option>
                    <option value="AGREEMENT">Agreement</option>
                    <option value="COURT_DOCUMENT">Court Document</option>
                    <option value="EVIDENCE">Evidence</option>
                  </select>
                </label>
              </div>
              <div className="lp-form-actions">
                <button className="lp-btn lp-btn-secondary" onClick={() => setShowDocUpload(false)}>Cancel</button>
                <button className="lp-btn lp-btn-primary" disabled={!docForm.name} onClick={handleUploadDoc}>
                  <Upload size={15} /> Upload
                </button>
              </div>
            </div>
          )}

          {[['Client Documents', clientDocs], ['Lawyer Documents', lawyerDocs], ['Court Documents', courtDocs]].map(([label, docs]) => (
            (docs as CaseDocument[]).length > 0 && (
              <div key={label as string} className="lp-doc-section">
                <h4 className="lp-doc-section-label">{label as string}</h4>
                <div className="lp-doc-list">
                  {(docs as CaseDocument[]).map(doc => (
                    <div key={doc.docId} className="lp-doc-row">
                      <div className="lp-doc-icon">
                        {doc.fileType === 'IMAGE' ? <Image size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="lp-doc-info">
                        <strong>{doc.name}</strong>
                        <span>{doc.fileType} · {doc.fileSize} · {formatDate(doc.uploadedAt)}</span>
                        <span className="lp-muted">{doc.uploadedByName}</span>
                      </div>
                      <div className="lp-doc-actions">
                        <button className="lp-icon-btn" title="Download"><Download size={16} /></button>
                        {doc.uploadedBy === 'LAWYER' && (
                          <button className="lp-icon-btn lp-icon-danger" title="Delete" onClick={() => deleteDocument(c.caseId, doc.docId)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {c.documents.length === 0 && !showDocUpload && (
            <div className="lp-empty"><FileText size={24} /><p>No documents yet.</p></div>
          )}
        </div>
      )}

      {/* ─── Notes (Private) ─── */}
      {activeTab === 'notes' && (
        <div className="lp-card">
          <div className="lp-card-header">
            <div>
              <span className="lp-section-kicker">PRIVATE NOTES</span>
              <p className="lp-muted lp-note-disclaimer">🔒 These notes are private and not visible to the client.</p>
            </div>
            <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={() => { setEditingNote(null); setNoteForm({ title: '', content: '' }); setShowNoteForm(true); }}>
              <Plus size={15} /> Add Note
            </button>
          </div>

          {showNoteForm && (
            <div className="lp-inline-form">
              <h4>{editingNote ? 'Edit Note' : 'New Note'}</h4>
              <label>Title<input value={noteForm.title} onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Strategy note" /></label>
              <label>Content<textarea value={noteForm.content} onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))} rows={5} placeholder="Your private notes..." className="lp-textarea" /></label>
              <div className="lp-form-actions">
                <button className="lp-btn lp-btn-secondary" onClick={() => { setShowNoteForm(false); setEditingNote(null); }}>Cancel</button>
                <button className="lp-btn lp-btn-primary" disabled={!noteForm.title || !noteForm.content} onClick={handleSaveNote}>
                  <PenLine size={15} /> {editingNote ? 'Update' : 'Save Note'}
                </button>
              </div>
            </div>
          )}

          {c.notes.length === 0 && !showNoteForm ? (
            <div className="lp-empty"><PenLine size={24} /><p>No private notes yet.</p></div>
          ) : (
            <div className="lp-notes-list">
              {c.notes.map(note => (
                <div key={note.noteId} className="lp-note-card">
                  <div className="lp-note-header">
                    <h4>{note.title}</h4>
                    <div className="lp-note-actions">
                      <button className="lp-icon-btn" onClick={() => { setEditingNote(note); setNoteForm({ title: note.title, content: note.content }); setShowNoteForm(true); }}>
                        <PenLine size={15} />
                      </button>
                      <button className="lp-icon-btn lp-icon-danger" onClick={() => deleteNote(c.caseId, note.noteId)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p>{note.content}</p>
                  <small className="lp-muted">Updated {formatDate(note.updatedAt)}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Chat ─── */}
      {activeTab === 'chat' && (
        <div className="lp-card lp-chat-card">
          <div className="lp-card-header">
            <span className="lp-section-kicker">CLIENT CHAT — {c.client.name}</span>
          </div>
          <div className="lp-chat-body">
            {c.messages.length === 0 ? (
              <div className="lp-empty"><MessageSquareText size={24} /><p>No messages yet.</p></div>
            ) : (
              <div className="lp-message-list">
                {c.messages.map(msg => (
                  <div key={msg.messageId} className={cx('lp-message-row', msg.senderRole === 'LAWYER' && 'lp-message-lawyer')}>
                    <div className="lp-message-avatar">
                      {msg.senderName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="lp-message-bubble">
                      <div className="lp-message-meta">
                        <strong>{msg.senderRole === 'LAWYER' ? 'You' : msg.senderName}</strong>
                        <small>{formatDateTime(msg.sentAt)}</small>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="lp-chat-composer">
            <textarea
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="Type a message..."
              rows={2}
              className="lp-textarea lp-chat-input"
            />
            <button className="lp-btn lp-btn-primary" onClick={handleSendMessage} disabled={!chatText.trim()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Appointments ─── */}
      {activeTab === 'appointments' && (
        <div className="lp-card">
          <span className="lp-section-kicker">APPOINTMENTS</span>
          {c.appointments.length === 0 ? (
            <div className="lp-empty"><Calendar size={24} /><p>No appointments for this case.</p></div>
          ) : (
            <div className="lp-list">
              {c.appointments.map(a => (
                <div key={a.appointmentId} className="lp-appt-row">
                  <div className="lp-date-tile">
                    <b>{new Date(a.date).getDate()}</b>
                    <span>{new Date(a.date).toLocaleString('en-IN', { month: 'short' })}</span>
                  </div>
                  <div className="lp-list-content">
                    <strong>{a.type === 'VIDEO' ? '🎥 Video Consultation' : '🏢 Office Visit'}</strong>
                    <span><Clock size={12} /> {a.time}</span>
                    {a.meetingLink && <a href={a.meetingLink} className="lp-link" target="_blank" rel="noreferrer">Join meeting</a>}
                  </div>
                  <div className="lp-list-right">
                    <span className={cx('lp-pill', a.status === 'CONFIRMED' ? 'lp-pill-teal' : a.status === 'COMPLETED' ? 'lp-pill-green' : 'lp-pill-gold')}>
                      {a.status}
                    </span>
                    <strong>₹{a.fee.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Payments ─── */}
      {activeTab === 'payments' && (
        <div className="lp-card">
          <span className="lp-section-kicker">PAYMENTS</span>
          {c.payments.length === 0 ? (
            <div className="lp-empty"><CreditCard size={24} /><p>No payments for this case.</p></div>
          ) : (
            <div className="lp-list">
              {c.payments.map(p => (
                <div key={p.paymentId} className="lp-payment-row">
                  <div className="lp-list-content">
                    <strong>{p.type}</strong>
                    <span>{formatDate(p.date)} · Receipt: {p.receiptNumber}</span>
                  </div>
                  <div className="lp-list-right">
                    <strong className={p.status === 'PAID' ? 'lp-text-green' : 'lp-text-gold'}>₹{p.amount.toLocaleString('en-IN')}</strong>
                    <span className={cx('lp-pill', p.status === 'PAID' ? 'lp-pill-teal' : 'lp-pill-gold')}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Status ─── */}
      {activeTab === 'status' && (
        <div className="lp-case-detail-grid">
          <div className="lp-card">
            <div className="lp-card-header">
              <span className="lp-section-kicker">UPDATE STATUS</span>
              {!showStatusForm && (
                <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={() => setShowStatusForm(true)}>
                  Update Status
                </button>
              )}
            </div>
            <div className="lp-current-status-display">
              <span>Current Status:</span>
              <span className={cx('lp-pill lp-pill-lg', STATUS_PILL[c.currentStatus])}>
                {STATUS_LABEL[c.currentStatus]}
              </span>
            </div>
            {showStatusForm && (
              <div className="lp-inline-form">
                <label>New Status
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value as CaseStatus)} className="lp-select">
                    <option value="">— Select status —</option>
                    {STATUS_SEQUENCE.filter(s => s !== c.currentStatus).map(s => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </label>
                <label>Note (optional)
                  <textarea value={statusNote} onChange={e => setStatusNote(e.target.value)} rows={3} placeholder="Add a note about this status change..." className="lp-textarea" />
                </label>
                <div className="lp-form-actions">
                  <button className="lp-btn lp-btn-secondary" onClick={() => setShowStatusForm(false)}>Cancel</button>
                  <button className="lp-btn lp-btn-primary" disabled={!newStatus} onClick={handleStatusUpdate}>
                    <CheckCircle2 size={15} /> Update Status
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="lp-card">
            <span className="lp-section-kicker">STATUS HISTORY</span>
            {c.statusHistory.length === 0 ? (
              <div className="lp-empty"><Clock size={20} /><p>No status changes yet.</p></div>
            ) : (
              <div className="lp-timeline">
                {[...c.statusHistory].reverse().map(h => (
                  <div key={h.id} className="lp-timeline-item">
                    <div className="lp-timeline-dot lp-dot-done"><CheckCircle2 size={14} /></div>
                    <div className="lp-timeline-content">
                      <strong>{STATUS_LABEL[h.previousStatus]} → {STATUS_LABEL[h.newStatus]}</strong>
                      {h.note && <p>{h.note}</p>}
                      <small>{formatDateTime(h.changedAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
