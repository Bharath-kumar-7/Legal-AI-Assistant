import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import { Search, BriefcaseBusiness, Filter, ChevronRight } from 'lucide-react';
import type { LawyerCase } from '../types';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

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

type TabId = 'active' | 'pending' | 'completed' | 'closed';

const TAB_FILTER: Record<TabId, (c: LawyerCase) => boolean> = {
  active: c => ['ASSIGNED', 'CONSULTATION_SCHEDULED', 'UNDER_REVIEW', 'LEGAL_NOTICE', 'COURT_FILING', 'HEARING'].includes(c.currentStatus),
  pending: c => c.currentStatus === 'DOCUMENTS_PENDING',
  completed: c => c.currentStatus === 'RESOLVED',
  closed: c => c.currentStatus === 'CLOSED',
};

export function MyCases({ onOpenCase }: { onOpenCase: (caseId: string) => void }) {
  const { cases } = useLawyer();
  const [tab, setTab] = useState<TabId>('active');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = [...new Set(cases.map(c => c.caseCategory))];

  const filtered = cases.filter(c => {
    const matchTab = TAB_FILTER[tab](c);
    const matchSearch =
      !search ||
      c.caseTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.client.name.toLowerCase().includes(search.toLowerCase()) ||
      c.caseId.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || c.caseCategory === categoryFilter;
    return matchTab && matchSearch && matchCat;
  });

  const tabCounts: Record<TabId, number> = {
    active: cases.filter(TAB_FILTER.active).length,
    pending: cases.filter(TAB_FILTER.pending).length,
    completed: cases.filter(TAB_FILTER.completed).length,
    closed: cases.filter(TAB_FILTER.closed).length,
  };

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / MY PRACTICE</span>
          <h1>My Cases</h1>
          <p>A complete view of all your cases — active, pending, completed, and closed.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="lp-tabs">
        {([['active', 'Active'], ['pending', 'Pending'], ['completed', 'Resolved'], ['closed', 'Closed']] as [TabId, string][]).map(([id, label]) => (
          <button key={id} className={cx('lp-tab', tab === id && 'lp-tab-active')} onClick={() => setTab(id)}>
            {label}
            <span className="lp-tab-count">{tabCounts[id]}</span>
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
            placeholder="Search by title, client, or case ID..."
          />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="lp-select">
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Cases */}
      <div className="lp-card">
        {filtered.length === 0 ? (
          <div className="lp-empty">
            <BriefcaseBusiness size={24} />
            <p>No {tab} cases match your filter.</p>
          </div>
        ) : (
          <div className="lp-case-list">
            {filtered.map(c => (
              <CaseCard key={c.caseId} c={c} onOpen={() => onOpenCase(c.caseId)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CaseCard({ c, onOpen }: { c: LawyerCase; onOpen: () => void }) {
  const msgCount = c.messages.filter(m => m.senderRole === 'CLIENT' && !m.readAt).length;

  return (
    <div className="lp-case-card" onClick={onOpen} role="button">
      <div className="lp-case-card-left">
        <div className="lp-list-icon lp-icon-navy">
          <BriefcaseBusiness size={18} />
        </div>
        <div className="lp-case-info">
          <div className="lp-case-meta">
            <code className="lp-mono lp-mono-sm">{c.caseId}</code>
            <span className={cx('lp-pill', STATUS_PILL[c.currentStatus])}>
              {STATUS_LABEL[c.currentStatus]}
            </span>
            {msgCount > 0 && (
              <span className="lp-badge">{msgCount} new</span>
            )}
          </div>
          <h3 className="lp-case-title">{c.caseTitle}</h3>
          <div className="lp-case-details">
            <span>👤 {c.client.name}</span>
            <span>⚖️ vs. {c.oppositeParty}</span>
            <span>📁 {c.caseCategory}</span>
            <span>📄 {c.documents.length} docs</span>
            <span>🗓 Updated {formatDate(c.lastUpdatedAt)}</span>
          </div>
        </div>
      </div>
      <ChevronRight size={18} className="lp-chevron" />
    </div>
  );
}
