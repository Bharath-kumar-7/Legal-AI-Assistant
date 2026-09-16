import React from 'react';
import {
  Users,
  Scale,
  ShieldAlert,
  Clock,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  FileCheck,
  BellRing,
  Award,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminKpiCard } from '../components/AdminKpiCard';
import { Link } from 'wouter';

export const AdminDashboard: React.FC = () => {
  const { stats, auditLogs, settings, lawyers } = useAdmin();

  const recentLogs = auditLogs.slice(0, 6);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // Specialization breakdown calculation
  const specCounts = lawyers.reduce<Record<string, number>>((acc, l) => {
    acc[l.specialization] = (acc[l.specialization] || 0) + 1;
    return acc;
  }, {});

  const totalLawyers = lawyers.length || 1;

  return (
    <div className="admin-page-container">
      {/* Executive Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">
            PLATFORM GOVERNANCE
          </div>
          <h1 className="admin-page-title">Executive Command Dashboard</h1>
          <p className="admin-page-desc">
            Overview of advocate verifications, client accounts, compliance reports, and system operations.
          </p>
        </div>
        <div className="header-actions">
          <Link href="/admin/lawyers" className="admin-btn admin-btn-primary">
            <FileCheck size={16} /> Verification Queue ({stats.lawyers.pendingVerification})
          </Link>
        </div>
      </div>

      {/* Emergency Maintenance Mode Alert */}
      {settings.general.maintenanceMode && (
        <div className="admin-alert-box alert-warning">
          <AlertTriangle size={18} />
          <div>
            <strong>Emergency Maintenance Mode Active:</strong> Public user and advocate access is restricted.
            Platform broadcast: &ldquo;{settings.general.maintenanceMessage}&rdquo;
          </div>
        </div>
      )}

      {/* Primary KPI Hero Metrics */}
      <div className="admin-kpi-grid">
        <AdminKpiCard
          title="Registered Clients"
          totalValue={stats.users.total}
          icon={Users}
          tone="navy"
          subStats={[
            { label: 'Active', value: stats.users.active, tone: 'success' },
            { label: 'Suspended', value: stats.users.suspended, tone: 'warning' },
            { label: 'Deactivated', value: stats.users.deactivated, tone: 'danger' },
          ]}
        />

        <AdminKpiCard
          title="Advocate Network"
          totalValue={stats.lawyers.total}
          icon={Scale}
          tone="gold"
          badge={
            stats.lawyers.pendingVerification > 0
              ? `${stats.lawyers.pendingVerification} Need Verification`
              : undefined
          }
          subStats={[
            { label: 'Verified', value: stats.lawyers.active, tone: 'success' },
            { label: 'Pending', value: stats.lawyers.pendingVerification, tone: 'warning' },
            { label: 'Suspended', value: stats.lawyers.suspended, tone: 'danger' },
            { label: 'Rejected', value: stats.lawyers.rejected, tone: 'neutral' },
          ]}
        />

        <AdminKpiCard
          title="Compliance & Reports"
          totalValue={stats.reports.pending + stats.reports.underReview + stats.reports.resolved}
          icon={ShieldAlert}
          tone="danger"
          badge={stats.reports.pending > 0 ? `${stats.reports.pending} Require Action` : undefined}
          subStats={[
            { label: 'Pending', value: stats.reports.pending, tone: 'danger' },
            { label: 'Under Review', value: stats.reports.underReview, tone: 'warning' },
            { label: 'Resolved', value: stats.reports.resolved, tone: 'success' },
          ]}
        />
      </div>

      {/* Row 2: Specialization Breakdown + Priority Action Triage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Advocate Specialization Distribution Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="title-with-icon">
              <Award size={18} />
              <h3>Advocate Specialization Distribution</h3>
            </div>
          </div>
          <div className="settings-card-body" style={{ gap: '0.9rem' }}>
            {Object.entries(specCounts).map(([spec, count]) => {
              const pct = Math.round((count / totalLawyers) * 100);
              return (
                <div key={spec} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
                    <span>{spec}</span>
                    <span style={{ color: 'var(--admin-text-secondary)' }}>{count} advocates ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--admin-surface-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--admin-gold)', borderRadius: '999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Triage Action Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <span className="section-kicker">IMMEDIATE ADMINISTRATIVE TRIAGE</span>
          
          <Link href="/admin/lawyers" className="quick-card">
            <UserCheck size={20} style={{ color: 'var(--admin-gold-text)' }} />
            <div>
              <strong>Pending Advocate Bar Verifications</strong>
              <small>{stats.lawyers.pendingVerification} enrollment credentials awaiting review</small>
            </div>
            <ArrowRight size={16} />
          </Link>

          <Link href="/admin/reports" className="quick-card">
            <ShieldAlert size={20} style={{ color: 'var(--admin-danger-text)' }} />
            <div>
              <strong>Open Dispute & Misconduct Reports</strong>
              <small>{stats.reports.pending} new complaints require investigation</small>
            </div>
            <ArrowRight size={16} />
          </Link>

          <Link href="/admin/notifications" className="quick-card">
            <BellRing size={20} style={{ color: 'var(--admin-primary)' }} />
            <div>
              <strong>Platform Announcements & Alerts</strong>
              <small>Broadcast maintenance alerts or policy notices to users</small>
            </div>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="admin-recent-activity-card">
        <div className="card-header-flex">
          <div>
            <span className="section-kicker">SECURITY & COMPLIANCE LEDGER</span>
            <h3>Live Administrative Activity Stream</h3>
          </div>
          <Link href="/admin/audit-logs" className="admin-btn admin-btn-secondary compact">
            View Complete Audit Trail <ArrowRight size={14} />
          </Link>
        </div>

        <div className="activity-timeline">
          {recentLogs.map((log) => (
            <div key={log.id} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-top">
                  <span className="timeline-action">{log.action.replaceAll('_', ' ')}</span>
                  <span className="timeline-entity">Target: <code>{log.entityId}</code></span>
                  <span className="timeline-admin">by {log.adminName}</span>
                  <time className="timeline-time">
                    <Clock size={12} /> {formatDate(log.timestamp)}
                  </time>
                </div>
                <p className="timeline-desc">{log.description}</p>
                {log.reason && (
                  <div className="timeline-reason">
                    <strong>Reason:</strong> {log.reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
