import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import { IndianRupee, CreditCard, Download, TrendingUp, ArrowUpRight } from 'lucide-react';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PAYMENT_TYPE_LABEL: Record<string, string> = {
  CONSULTATION: 'Consultation Fee',
  CASE_FEE: 'Case Fee',
  RETAINER: 'Retainer',
  COURT_FILING: 'Court Filing',
};

export function LawyerPayments() {
  const { payments, earnings } = useLawyer();
  const [tab, setTab] = useState<'history' | 'earnings'>('history');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = payments.filter(p => !statusFilter || p.status === statusFilter);

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / FINANCIAL RECORD</span>
          <h1>Payments & Earnings</h1>
          <p>A complete record of your consultation fees and case payments.</p>
        </div>
        <button className="lp-btn lp-btn-secondary">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="lp-tabs">
        <button className={cx('lp-tab', tab === 'history' && 'lp-tab-active')} onClick={() => setTab('history')}>
          Payment History
        </button>
        <button className={cx('lp-tab', tab === 'earnings' && 'lp-tab-active')} onClick={() => setTab('earnings')}>
          Earnings Summary
        </button>
      </div>

      {tab === 'earnings' && (
        <div>
          {/* Earnings Stats */}
          <div className="lp-stats-grid">
            <div className="lp-stat-card lp-stat-navy">
              <span className="lp-stat-icon"><IndianRupee size={20} /></span>
              <div>
                <span className="lp-stat-label">Total Earnings</span>
                <strong className="lp-stat-value">₹{earnings.totalEarnings.toLocaleString('en-IN')}</strong>
                <small>All time</small>
              </div>
            </div>
            <div className="lp-stat-card lp-stat-gold">
              <span className="lp-stat-icon"><CreditCard size={20} /></span>
              <div>
                <span className="lp-stat-label">Pending</span>
                <strong className="lp-stat-value">₹{earnings.pendingEarnings.toLocaleString('en-IN')}</strong>
                <small>Awaiting payment</small>
              </div>
            </div>
            <div className="lp-stat-card lp-stat-teal">
              <span className="lp-stat-icon"><TrendingUp size={20} /></span>
              <div>
                <span className="lp-stat-label">This Month</span>
                <strong className="lp-stat-value">₹{earnings.thisMonth.toLocaleString('en-IN')}</strong>
                <small>Sep 2026</small>
              </div>
            </div>
            <div className="lp-stat-card lp-stat-navy">
              <span className="lp-stat-icon"><ArrowUpRight size={20} /></span>
              <div>
                <span className="lp-stat-label">Last Month</span>
                <strong className="lp-stat-value">₹{earnings.lastMonth.toLocaleString('en-IN')}</strong>
                <small>Aug 2026</small>
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="lp-card">
            <span className="lp-section-kicker">EARNINGS BREAKDOWN</span>
            <div className="lp-earnings-breakdown">
              <div className="lp-earnings-breakdown-row">
                <span>Completed payments</span>
                <strong className="lp-text-green">₹{(earnings.totalEarnings - earnings.pendingEarnings - earnings.refundedAmount).toLocaleString('en-IN')}</strong>
              </div>
              <div className="lp-earnings-breakdown-row">
                <span>Pending payments</span>
                <strong className="lp-text-gold">₹{earnings.pendingEarnings.toLocaleString('en-IN')}</strong>
              </div>
              <div className="lp-earnings-breakdown-row">
                <span>Refunded</span>
                <strong className="lp-text-red">₹{earnings.refundedAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="lp-earnings-breakdown-row lp-earnings-total">
                <span>Total cases handled</span>
                <strong>{earnings.completedPayments}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="lp-card">
          <div className="lp-card-header">
            <span className="lp-section-kicker">TRANSACTION HISTORY</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="lp-select">
              <option value="">All statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="lp-empty"><CreditCard size={24} /><p>No payments found.</p></div>
          ) : (
            <div className="lp-payment-table">
              <div className="lp-payment-table-head">
                <span>Payment ID</span>
                <span>Case</span>
                <span>Client</span>
                <span>Type</span>
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
                <span />
              </div>
              {filtered.map(p => (
                <div key={p.paymentId} className="lp-payment-table-row">
                  <code className="lp-mono lp-mono-sm">{p.paymentId}</code>
                  <span className="lp-muted">{p.caseTitle.length > 20 ? p.caseTitle.substring(0, 20) + '…' : p.caseTitle}</span>
                  <span>{p.clientName}</span>
                  <span>{PAYMENT_TYPE_LABEL[p.type] || p.type}</span>
                  <span>{formatDate(p.date)}</span>
                  <strong className={p.status === 'PAID' ? 'lp-text-green' : 'lp-text-gold'}>
                    ₹{p.amount.toLocaleString('en-IN')}
                  </strong>
                  <span className={cx('lp-pill', p.status === 'PAID' ? 'lp-pill-teal' : p.status === 'REFUNDED' ? 'lp-pill-neutral' : 'lp-pill-gold')}>
                    {p.status}
                  </span>
                  <button className="lp-icon-btn" title="Download receipt"><Download size={15} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
