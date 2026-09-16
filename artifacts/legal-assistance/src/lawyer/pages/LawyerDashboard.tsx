import React from 'react';
import { useLawyer } from '../context/LawyerContext';
import {
  BriefcaseBusiness, CalendarDays, MessageSquareText, Bell, FileText,
  ArrowRight, Clock, CheckCircle2, AlertCircle, IndianRupee, Users,
  TrendingUp, BookOpen, Scale,
} from 'lucide-react';

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: 'teal',
  CONSULTATION_SCHEDULED: 'teal',
  DOCUMENTS_PENDING: 'gold',
  UNDER_REVIEW: 'gold',
  LEGAL_NOTICE: 'navy',
  COURT_FILING: 'navy',
  HEARING: 'navy',
  RESOLVED: 'green',
  CLOSED: 'neutral',
};

const STATUS_LABELS: Record<string, string> = {
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

export function LawyerDashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { profile, caseRequests, cases, appointments, notifications, payments, earnings } = useLawyer();

  const activeCases = cases.filter(c => !['RESOLVED', 'CLOSED'].includes(c.currentStatus));
  const newRequests = caseRequests.filter(r => r.status === 'PENDING' || r.status === 'INFO_REQUESTED');
  const upcomingAppts = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const unreadMsgs = cases.reduce((acc, c) => acc + c.messages.filter(m => m.senderRole === 'CLIENT' && !m.readAt).length, 0);
  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const recentRequests = caseRequests.slice(0, 3);
  const recentPayments = payments.slice(0, 3);
  const recentNotifs = notifications.slice(0, 4);

  return (
    <div className="lp-page">
      {/* Page Header */}
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / LAWYER WORKSPACE</span>
          <h1>Good morning, {profile.fullName.replace('Adv. ', '')}.</h1>
          <p>Here is your legal practice at a glance.</p>
        </div>
        <div className="lp-header-badge">
          <Scale size={16} />
          <span>Verified Advocate</span>
          <CheckCircle2 size={14} className="lp-verified-icon" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="lp-stats-grid">
        <div className="lp-stat-card lp-stat-navy" onClick={() => onNavigate('/lawyer/cases')} role="button">
          <span className="lp-stat-icon"><BriefcaseBusiness size={20} /></span>
          <div>
            <span className="lp-stat-label">Active Cases</span>
            <strong className="lp-stat-value">{activeCases.length}</strong>
            <small>In progress</small>
          </div>
        </div>
        <div className="lp-stat-card lp-stat-gold" onClick={() => onNavigate('/lawyer/requests')} role="button">
          <span className="lp-stat-icon"><AlertCircle size={20} /></span>
          <div>
            <span className="lp-stat-label">New Requests</span>
            <strong className="lp-stat-value">{newRequests.length}</strong>
            <small>Awaiting action</small>
          </div>
        </div>
        <div className="lp-stat-card lp-stat-teal" onClick={() => onNavigate('/lawyer/appointments')} role="button">
          <span className="lp-stat-icon"><CalendarDays size={20} /></span>
          <div>
            <span className="lp-stat-label">Upcoming Appts</span>
            <strong className="lp-stat-value">{upcomingAppts.length}</strong>
            <small>Scheduled</small>
          </div>
        </div>
        <div className="lp-stat-card lp-stat-navy" onClick={() => onNavigate('/lawyer/messages')} role="button">
          <span className="lp-stat-icon"><MessageSquareText size={20} /></span>
          <div>
            <span className="lp-stat-label">Unread Messages</span>
            <strong className="lp-stat-value">{unreadMsgs}</strong>
            <small>From clients</small>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="lp-dashboard-grid">
        {/* Recent Case Requests */}
        <div className="lp-card lp-card-span2">
          <div className="lp-card-header">
            <div>
              <span className="lp-section-kicker">PENDING ACTION</span>
              <h3>Recent Case Requests</h3>
            </div>
            <button className="lp-quiet-link" onClick={() => onNavigate('/lawyer/requests')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {recentRequests.length === 0 ? (
            <div className="lp-empty"><BookOpen size={20} /><p>No pending case requests.</p></div>
          ) : (
            <div className="lp-list">
              {recentRequests.map(req => (
                <div key={req.requestId} className="lp-list-row">
                  <div className="lp-list-icon lp-icon-navy"><BriefcaseBusiness size={16} /></div>
                  <div className="lp-list-content">
                    <strong>{req.caseTitle}</strong>
                    <span>
                      <Users size={13} /> {req.client.name} &nbsp;·&nbsp;
                      <FileText size={13} /> {req.documents.length} docs &nbsp;·&nbsp;
                      {req.caseCategory}
                    </span>
                  </div>
                  <div className="lp-list-right">
                    <span className={cx('lp-pill', req.status === 'PENDING' ? 'lp-pill-gold' : 'lp-pill-teal')}>
                      {req.status === 'INFO_REQUESTED' ? 'Info Requested' : 'Pending'}
                    </span>
                    <small>{formatTimeAgo(req.requestedAt)}</small>
                    <button
                      className="lp-btn lp-btn-secondary lp-btn-sm"
                      onClick={() => onNavigate(`/lawyer/requests/${req.requestId}`)}
                    >
                      View Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earnings Summary */}
        <div className="lp-card">
          <div className="lp-card-header">
            <div>
              <span className="lp-section-kicker">EARNINGS</span>
              <h3>This Period</h3>
            </div>
            <button className="lp-quiet-link" onClick={() => onNavigate('/lawyer/payments')}>
              Full history <ArrowRight size={14} />
            </button>
          </div>
          <div className="lp-earnings-summary">
            <div className="lp-earnings-main">
              <IndianRupee size={22} />
              <strong>{earnings.totalEarnings.toLocaleString('en-IN')}</strong>
              <span>Total earnings</span>
            </div>
            <div className="lp-earnings-row">
              <span>Completed</span>
              <strong className="lp-text-green">₹{(earnings.totalEarnings - earnings.pendingEarnings).toLocaleString('en-IN')}</strong>
            </div>
            <div className="lp-earnings-row">
              <span>Pending</span>
              <strong className="lp-text-gold">₹{earnings.pendingEarnings.toLocaleString('en-IN')}</strong>
            </div>
            <div className="lp-earnings-row">
              <span>Cases handled</span>
              <strong>{earnings.completedPayments}</strong>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="lp-card">
          <div className="lp-card-header">
            <div>
              <span className="lp-section-kicker">CALENDAR</span>
              <h3>Upcoming Appointments</h3>
            </div>
            <button className="lp-quiet-link" onClick={() => onNavigate('/lawyer/appointments')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {upcomingAppts.length === 0 ? (
            <div className="lp-empty"><CalendarDays size={20} /><p>No upcoming appointments.</p></div>
          ) : (
            <div className="lp-list">
              {upcomingAppts.map(apt => (
                <div key={apt.appointmentId} className="lp-appt-row">
                  <div className="lp-date-tile">
                    <b>{new Date(apt.date).getDate()}</b>
                    <span>{new Date(apt.date).toLocaleString('en-IN', { month: 'short' })}</span>
                  </div>
                  <div className="lp-list-content">
                    <strong>{apt.client.name}</strong>
                    <span><Clock size={12} /> {apt.time} &nbsp;·&nbsp; {apt.type === 'VIDEO' ? '🎥 Video' : '🏢 Office'}</span>
                    <small>{apt.caseTitle}</small>
                  </div>
                  <span className={cx('lp-pill', apt.status === 'CONFIRMED' ? 'lp-pill-teal' : 'lp-pill-gold')}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="lp-card">
          <div className="lp-card-header">
            <div>
              <span className="lp-section-kicker">ALERTS</span>
              <h3>Recent Notifications</h3>
            </div>
            <button className="lp-quiet-link" onClick={() => onNavigate('/lawyer/notifications')}>
              View all {unreadNotifs > 0 && <span className="lp-badge">{unreadNotifs}</span>} <ArrowRight size={14} />
            </button>
          </div>
          <div className="lp-list">
            {recentNotifs.map(n => (
              <div key={n.notificationId} className={cx('lp-notif-row', !n.isRead && 'lp-notif-unread')}>
                <span className={cx('lp-notif-dot', n.source === 'ADMIN' ? 'lp-dot-gold' : n.source === 'SYSTEM' ? 'lp-dot-teal' : 'lp-dot-navy')} />
                <div className="lp-list-content">
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <small>{formatTimeAgo(n.createdAt)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Cases Overview */}
        <div className="lp-card lp-card-span2">
          <div className="lp-card-header">
            <div>
              <span className="lp-section-kicker">MY PRACTICE</span>
              <h3>Active Cases</h3>
            </div>
            <button className="lp-quiet-link" onClick={() => onNavigate('/lawyer/cases')}>
              All cases <ArrowRight size={14} />
            </button>
          </div>
          <div className="lp-list">
            {activeCases.slice(0, 4).map(c => (
              <div key={c.caseId} className="lp-list-row">
                <div className="lp-list-icon lp-icon-teal"><Scale size={16} /></div>
                <div className="lp-list-content">
                  <strong>{c.caseTitle}</strong>
                  <span>{c.client.name} &nbsp;·&nbsp; vs. {c.oppositeParty}</span>
                </div>
                <div className="lp-list-right">
                  <span className={cx('lp-pill', `lp-pill-${STATUS_COLORS[c.currentStatus] || 'neutral'}`)}>
                    {STATUS_LABELS[c.currentStatus] || c.currentStatus}
                  </span>
                  <small>{formatDate(c.lastUpdatedAt)}</small>
                  <button className="lp-btn lp-btn-secondary lp-btn-sm" onClick={() => onNavigate(`/lawyer/cases/${c.caseId}`)}>
                    Open
                  </button>
                </div>
              </div>
            ))}
            {activeCases.length === 0 && (
              <div className="lp-empty"><BriefcaseBusiness size={20} /><p>No active cases.</p></div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="lp-card">
          <div className="lp-card-header">
            <div>
              <span className="lp-section-kicker">RECENT</span>
              <h3>Payments</h3>
            </div>
            <button className="lp-quiet-link" onClick={() => onNavigate('/lawyer/payments')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="lp-list">
            {recentPayments.map(p => (
              <div key={p.paymentId} className="lp-payment-row">
                <div className="lp-list-content">
                  <strong>{p.clientName}</strong>
                  <span>{p.type} &nbsp;·&nbsp; {formatDate(p.date)}</span>
                </div>
                <div className="lp-list-right">
                  <strong className={p.status === 'PAID' ? 'lp-text-green' : 'lp-text-gold'}>
                    ₹{p.amount.toLocaleString('en-IN')}
                  </strong>
                  <span className={cx('lp-pill', p.status === 'PAID' ? 'lp-pill-teal' : 'lp-pill-gold')}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
