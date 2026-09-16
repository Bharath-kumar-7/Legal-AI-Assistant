import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { Link, useLocation } from 'wouter';

interface AdminTopbarProps {
  onOpenMobile: () => void;
  adminName?: string;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onOpenMobile, adminName = 'Chief Admin' }) => {
  const { stats, settings } = useAdmin();
  const [location] = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem('nyaya-theme') === 'dark');

  const toggleTheme = () => {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    localStorage.setItem('nyaya-theme', nextDark ? 'dark' : 'light');
  };

  const pendingAttentionCount = stats.lawyers.pendingVerification + stats.reports.pending;

  const getBreadcrumb = () => {
    if (location.includes('/admin/users')) return 'Clients & Users';
    if (location.includes('/admin/lawyers')) return 'Advocate Directory & Verification';
    if (location.includes('/admin/reports')) return 'Reports & Complaints';
    if (location.includes('/admin/notifications')) return 'Broadcast Announcements';
    if (location.includes('/admin/audit-logs')) return 'Audit Trail Ledger';
    if (location.includes('/admin/settings')) return 'Platform Governance & Settings';
    if (location.includes('/admin/profile')) return 'Administrator Account';
    return 'Executive Overview';
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button
          className="admin-icon-btn mobile-menu-btn"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Dynamic Location Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--admin-text-tertiary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.08em' }}>NYAYA</span>
          <ChevronRight size={14} style={{ color: 'var(--admin-text-tertiary)' }} />
          <span style={{ color: 'var(--admin-text-primary)' }}>{getBreadcrumb()}</span>
        </div>

        {settings.general.maintenanceMode && (
          <div className="maintenance-mode-pill">
            <AlertTriangle size={13} />
            <span>Maintenance Active</span>
          </div>
        )}
      </div>

      <div className="topbar-right">
        <div className="platform-security-pill">
          <ShieldCheck size={14} className="text-success" />
          <span>AES-256</span>
        </div>

        {/* Quick Triage Bell */}
        <Link href="/admin/reports" className="admin-icon-btn notification-bell-wrap" title={`${pendingAttentionCount} items need attention`}>
          <Bell size={17} />
          {pendingAttentionCount > 0 && <span className="bell-badge-pip">{pendingAttentionCount}</span>}
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          className="admin-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          title="Toggle Light / Dark mode"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Profile Shortcut */}
        <Link href="/admin/profile" className="admin-topbar-profile" title="Admin Profile">
          <div className="topbar-avatar">AD</div>
          <span className="admin-topbar-name">{adminName}</span>
        </Link>
      </div>
    </header>
  );
};
