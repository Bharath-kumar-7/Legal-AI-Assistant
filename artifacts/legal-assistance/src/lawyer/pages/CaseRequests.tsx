import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import {
  Search, Filter, FileText, Users, Calendar, ChevronRight, Eye, Check, X,
  MessageSquareText, AlertCircle, Clock, Download, Image, File,
} from 'lucide-react';
import type { CaseRequest } from '../types';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'New Request',
  INFO_REQUESTED: 'Info Requested',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};
const STATUS_PILL: Record<string, string> = {
  PENDING: 'lp-pill-gold',
  INFO_REQUESTED: 'lp-pill-teal',
  ACCEPTED: 'lp-pill-green',
  REJECTED: 'lp-pill-neutral',
};

export function CaseRequests({ onViewRequest }: { onViewRequest: (requestId: string) => void }) {
  const { caseRequests } = useLawyer();
  const [tab, setTab] = useState<'all' | 'pending' | 'info' | 'decided'>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filtered = caseRequests.filter(r => {
    const matchTab =
      tab === 'all' ||
      (tab === 'pending' && r.status === 'PENDING') ||
      (tab === 'info' && r.status === 'INFO_REQUESTED') ||
      (tab === 'decided' && (r.status === 'ACCEPTED' || r.status === 'REJECTED'));
    const matchSearch =
      !search ||
      r.caseTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.client.name.toLowerCase().includes(search.toLowerCase()) ||
      r.requestId.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || r.caseCategory === categoryFilter;
    return matchTab && matchSearch && matchCat;
  });

  const categories = [...new Set(caseRequests.map(r => r.caseCategory))];

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / CASE REQUESTS</span>
          <h1>Case Requests</h1>
          <p>Review client case requests before accepting or rejecting.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="lp-tabs">
        {([['all', 'All'], ['pending', 'Pending'], ['info', 'Info Requested'], ['decided', 'Decided']] as const).map(([id, label]) => (
          <button
            key={id}
            className={cx('lp-tab', tab === id && 'lp-tab-active')}
            onClick={() => setTab(id)}
          >
            {label}
            <span className="lp-tab-count">
              {id === 'all' ? caseRequests.length
                : id === 'pending' ? caseRequests.filter(r => r.status === 'PENDING').length
                : id === 'info' ? caseRequests.filter(r => r.status === 'INFO_REQUESTED').length
                : caseRequests.filter(r => r.status === 'ACCEPTED' || r.status === 'REJECTED').length}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="lp-toolbar">
        <div className="lp-search-field">
          <Search size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, client, or request ID..."
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="lp-select"
        >
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="lp-card">
        {filtered.length === 0 ? (
          <div className="lp-empty">
            <FileText size={24} />
            <p>No case requests match your filter.</p>
          </div>
        ) : (
          <div className="lp-request-list">
            {filtered.map(req => (
              <CaseRequestCard key={req.requestId} req={req} onView={() => onViewRequest(req.requestId)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CaseRequestCard({ req, onView }: { req: CaseRequest; onView: () => void }) {
  return (
    <div className="lp-request-card">
      <div className="lp-request-card-header">
        <div className="lp-request-meta">
          <code className="lp-mono">{req.requestId}</code>
          <span className={cx('lp-pill', STATUS_PILL[req.status])}>{STATUS_LABEL[req.status]}</span>
        </div>
        <small className="lp-muted">{formatTimeAgo(req.requestedAt)}</small>
      </div>

      <h3 className="lp-request-title">{req.caseTitle}</h3>

      <div className="lp-request-details">
        <span><Users size={13} /> <strong>{req.client.name}</strong></span>
        <span><FileText size={13} /> {req.caseCategory}</span>
        <span><Calendar size={13} /> Requested {formatDate(req.requestedAt)}</span>
        <span><FileText size={13} /> {req.documents.length} documents</span>
        <span>
          {req.preferredConsultation === 'VIDEO' ? '🎥 Video' : '🏢 Office'} consultation preferred
        </span>
      </div>

      <p className="lp-request-desc">{req.description.substring(0, 180)}…</p>

      {req.infoRequests.length > 0 && (
        <div className="lp-info-request-banner">
          <MessageSquareText size={14} />
          <span>
            <strong>Info requested</strong> — awaiting client response (
            {req.infoRequests.filter(i => !i.clientResponse).length} pending)
          </span>
        </div>
      )}

      <div className="lp-request-card-footer">
        <div className="lp-doc-chips">
          {req.documents.slice(0, 3).map(d => (
            <span key={d.docId} className="lp-doc-chip">
              {d.fileType === 'IMAGE' ? <Image size={12} /> : <File size={12} />}
              {d.name.length > 20 ? d.name.substring(0, 20) + '…' : d.name}
            </span>
          ))}
          {req.documents.length > 3 && (
            <span className="lp-doc-chip lp-doc-chip-more">+{req.documents.length - 3} more</span>
          )}
        </div>
        <button className="lp-btn lp-btn-primary" onClick={onView}>
          Review Case <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
