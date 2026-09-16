import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import { FileText, Search, Upload, Download, Trash2, Filter, Image, File } from 'lucide-react';
import type { CaseDocument } from '../types';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function LawyerDocuments() {
  const { cases, profile, uploadDocument, deleteDocument } = useLawyer();
  const [search, setSearch] = useState('');
  const [filterBy, setFilterBy] = useState<'ALL' | 'CLIENT' | 'LAWYER' | 'COURT'>('ALL');
  const [caseFilter, setCaseFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCaseId, setUploadCaseId] = useState('');
  const [docForm, setDocForm] = useState({ name: '', fileType: 'PDF', category: 'LAWYER_DOCUMENT' as CaseDocument['category'] });

  // Collect all documents across all cases
  const allDocs = cases.flatMap(c => c.documents.map(d => ({ ...d, caseName: c.caseTitle })));

  const filtered = allDocs.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || (d.caseName || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterBy === 'ALL' || d.uploadedBy === filterBy;
    const matchCase = !caseFilter || d.caseId === caseFilter;
    return matchSearch && matchFilter && matchCase;
  });

  const handleUpload = () => {
    if (!docForm.name || !uploadCaseId) return;
    uploadDocument(uploadCaseId, {
      caseId: uploadCaseId,
      name: docForm.name,
      fileName: `${docForm.name.replace(/\s+/g, '_')}.${docForm.fileType.toLowerCase()}`,
      fileType: docForm.fileType,
      fileSize: '1 MB',
      category: docForm.category,
      uploadedBy: 'LAWYER',
      uploadedByName: profile.fullName,
    });
    setShowUpload(false);
    setDocForm({ name: '', fileType: 'PDF', category: 'LAWYER_DOCUMENT' });
    setUploadCaseId('');
  };

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / DOCUMENT VAULT</span>
          <h1>Documents</h1>
          <p>All case documents — from clients, yourself, and the court.</p>
        </div>
        <button className="lp-btn lp-btn-primary" onClick={() => setShowUpload(true)}>
          <Upload size={16} /> Upload Document
        </button>
      </div>

      {showUpload && (
        <div className="lp-card lp-inline-form">
          <h3>Upload Document</h3>
          <div className="lp-form-row">
            <label>Case
              <select value={uploadCaseId} onChange={e => setUploadCaseId(e.target.value)} className="lp-select">
                <option value="">Select case...</option>
                {cases.map(c => <option key={c.caseId} value={c.caseId}>{c.caseTitle}</option>)}
              </select>
            </label>
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
            <button className="lp-btn lp-btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
            <button className="lp-btn lp-btn-primary" disabled={!docForm.name || !uploadCaseId} onClick={handleUpload}>
              <Upload size={15} /> Upload
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="lp-toolbar">
        <div className="lp-search-field">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." />
        </div>
        <select value={filterBy} onChange={e => setFilterBy(e.target.value as typeof filterBy)} className="lp-select">
          <option value="ALL">All sources</option>
          <option value="CLIENT">Client documents</option>
          <option value="LAWYER">My documents</option>
          <option value="COURT">Court documents</option>
        </select>
        <select value={caseFilter} onChange={e => setCaseFilter(e.target.value)} className="lp-select">
          <option value="">All cases</option>
          {cases.map(c => <option key={c.caseId} value={c.caseId}>{c.caseTitle}</option>)}
        </select>
      </div>

      <div className="lp-card">
        <div className="lp-card-header">
          <span className="lp-section-kicker">ALL DOCUMENTS</span>
          <span className="lp-result-count">{filtered.length} files</span>
        </div>

        {filtered.length === 0 ? (
          <div className="lp-empty"><FileText size={24} /><p>No documents found.</p></div>
        ) : (
          <div className="lp-doc-table">
            <div className="lp-doc-table-head">
              <span>Document</span>
              <span>Case</span>
              <span>Source</span>
              <span>Date</span>
              <span>Size</span>
              <span />
            </div>
            {filtered.map(doc => (
              <div key={doc.docId} className="lp-doc-table-row">
                <div className="lp-doc-name-cell">
                  <span className="lp-doc-icon-sm">
                    {doc.fileType === 'IMAGE' ? <Image size={16} /> : <FileText size={16} />}
                  </span>
                  <div>
                    <b>{doc.name}</b>
                    <small>{doc.fileType}</small>
                  </div>
                </div>
                <span className="lp-muted">{(doc as any).caseName || doc.caseId}</span>
                <span>
                  <span className={cx(
                    'lp-pill lp-pill-sm',
                    doc.uploadedBy === 'CLIENT' ? 'lp-pill-teal'
                      : doc.uploadedBy === 'LAWYER' ? 'lp-pill-navy'
                      : 'lp-pill-gold'
                  )}>
                    {doc.uploadedBy === 'CLIENT' ? 'Client' : doc.uploadedBy === 'LAWYER' ? 'Lawyer' : 'Court'}
                  </span>
                </span>
                <span>{formatDate(doc.uploadedAt)}</span>
                <span>{doc.fileSize}</span>
                <div className="lp-doc-actions">
                  <button className="lp-icon-btn" title="Download"><Download size={16} /></button>
                  {doc.uploadedBy === 'LAWYER' && (
                    <button className="lp-icon-btn lp-icon-danger" title="Delete" onClick={() => deleteDocument(doc.caseId, doc.docId)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
