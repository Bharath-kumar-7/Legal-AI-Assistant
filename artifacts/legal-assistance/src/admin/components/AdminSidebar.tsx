import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  Scale,
  ShieldAlert,
  BellRing,
  ScrollText,
  Settings,
  UserCheck,
  LogOut,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
  adminName?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  onSignOut,
  adminName = 'Chief Administrator',
}) => {
  const [location] = useLocation();
  const { stats, settings } = useAdmin();

  const isCurrent = (path: string) => {
    if (path === '/admin' && (location === '/admin' || location === '/admin/dashboard')) return true;
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <>
      <aside className={`admin-sidebar ${mobileOpen ? 'admin-sidebar-open' : ''}`}>
        {/* Simple, Classic Nyaya Brand Lockup */}
        <div className="admin-sidebar-brand">
          <Link href="/admin/dashboard" className="brand-lockup-admin" onClick={onCloseMobile}>
            <span className="brand-mark-admin">
              <Scale size={18} strokeWidth={2.5} />
            </span>
            <span>nyaya</span>
            <span className="brand-admin-pill">admin</span>
          </Link>
          <button className="admin-icon-btn mobile-only" onClick={onCloseMobile} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Maintenance Mode Banner */}
        {settings.general.maintenanceMode && (
          <div className="sidebar-maintenance-notice" style={{ background: 'var(--admin-warning-text)', color: '#fff', padding: '0.5rem 1rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={14} />
            <span>Maintenance Active</span>
          </div>
        )}

        {/* Navigation Tree */}
        <div className="sidebar-scroll-area">
          <div>
            <div className="nav-section-label">Executive Core</div>
            <nav className="admin-nav-list">
              <Link
                href="/admin/dashboard"
                className={`admin-nav-item ${isCurrent('/admin/dashboard') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </Link>
            </nav>
          </div>

          <div>
            <div className="nav-section-label">Directory & Users</div>
            <nav className="admin-nav-list">
              <Link
                href="/admin/users"
                className={`admin-nav-item ${isCurrent('/admin/users') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Users size={17} />
                <span>Clients & Users</span>
                <span className="nav-count">{stats.users.total}</span>
              </Link>

              <Link
                href="/admin/lawyers"
                className={`admin-nav-item ${isCurrent('/admin/lawyers') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Scale size={17} />
                <span>Advocate Network</span>
                {stats.lawyers.pendingVerification > 0 ? (
                  <span className="nav-count badge-warning" title={`${stats.lawyers.pendingVerification} pending review`}>
                    {stats.lawyers.pendingVerification}
                  </span>
                ) : (
                  <span className="nav-count">{stats.lawyers.total}</span>
                )}
              </Link>
            </nav>
          </div>

          <div>
            <div className="nav-section-label">Trust & Moderation</div>
            <nav className="admin-nav-list">
              <Link
                href="/admin/reports"
                className={`admin-nav-item ${isCurrent('/admin/reports') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <ShieldAlert size={17} />
                <span>Reports & Disputes</span>
                {stats.reports.pending > 0 ? (
                  <span className="nav-count badge-danger" title={`${stats.reports.pending} open reports`}>
                    {stats.reports.pending}
                  </span>
                ) : (
                  <span className="nav-count">{stats.reports.pending + stats.reports.underReview + stats.reports.resolved}</span>
                )}
              </Link>

              <Link
                href="/admin/notifications"
                className={`admin-nav-item ${isCurrent('/admin/notifications') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <BellRing size={17} />
                <span>Announcements</span>
              </Link>
            </nav>
          </div>

          <div>
            <div className="nav-section-label">System & Audit</div>
            <nav className="admin-nav-list">
              <Link
                href="/admin/audit-logs"
                className={`admin-nav-item ${isCurrent('/admin/audit-logs') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <ScrollText size={17} />
                <span>Audit Logs</span>
              </Link>

              <Link
                href="/admin/settings"
                className={`admin-nav-item ${isCurrent('/admin/settings') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Settings size={17} />
                <span>Platform Settings</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer with Sign Out */}
        <div className="admin-sidebar-footer">
          <Link href="/admin/profile" className="admin-user-tile" onClick={onCloseMobile}>
            <div className="admin-avatar">AD</div>
            <div className="admin-user-info">
              <strong>{adminName}</strong>
              <span className="role-tag">Super Administrator</span>
            </div>
          </Link>

          <button
            type="button"
            className="admin-icon-btn"
            onClick={onSignOut}
            title="Sign out of Admin Console"
            aria-label="Sign out"
            style={{ color: 'var(--admin-sidebar-muted)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="admin-scrim" onClick={onCloseMobile} />}
    </>
  );
};
