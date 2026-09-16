import React, { useState } from 'react';
import { LawyerProvider, useLawyer } from './context/LawyerContext';
import {
  LayoutDashboard, BriefcaseBusiness, CalendarDays, MessageSquareText,
  FileText, CreditCard, Bell, Clock, UserRound, Menu, X, LogOut,
  Scale, Sun, Moon, ChevronDown, InboxIcon,
} from 'lucide-react';
import { LawyerDashboard } from './pages/LawyerDashboard';
import { CaseRequests } from './pages/CaseRequests';
import { CaseRequestDetail } from './pages/CaseRequestDetail';
import { MyCases } from './pages/MyCases';
import { CaseDetail } from './pages/CaseDetail';
import { LawyerAppointments } from './pages/LawyerAppointments';
import { LawyerMessages } from './pages/LawyerMessages';
import { LawyerDocuments } from './pages/LawyerDocuments';
import { LawyerPayments } from './pages/LawyerPayments';
import { LawyerNotifications } from './pages/LawyerNotifications';
import { LawyerAvailability } from './pages/LawyerAvailability';
import { LawyerProfile } from './pages/LawyerProfile';
import './lawyer.css';

// ─── Route State (simple in-app routing) ─────────────────────────────────────

type Route =
  | { page: 'dashboard' }
  | { page: 'requests' }
  | { page: 'request-detail'; requestId: string }
  | { page: 'cases' }
  | { page: 'case-detail'; caseId: string }
  | { page: 'appointments' }
  | { page: 'messages' }
  | { page: 'documents' }
  | { page: 'payments' }
  | { page: 'notifications' }
  | { page: 'availability' }
  | { page: 'profile' };

// ─── Toast Container ──────────────────────────────────────────────────────────

function ToastContainer() {
  const { toasts, removeToast } = useLawyer();
  return (
    <div className="lp-toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`lp-toast lp-toast-${t.type}`}>
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ─── Shell Inner ──────────────────────────────────────────────────────────────

interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'client' | 'lawyer';
}

function LawyerShellInner({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
  const { unreadCount, caseRequests, notifications } = useLawyer();
  const [route, setRoute] = useState<Route>({ page: 'dashboard' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('nyaya-theme') === 'dark');

  const newRequests = caseRequests.filter(r => r.status === 'PENDING' || r.status === 'INFO_REQUESTED').length;

  const navigate = (path: string) => {
    if (path === '/lawyer') { setRoute({ page: 'dashboard' }); }
    else if (path === '/lawyer/requests') { setRoute({ page: 'requests' }); }
    else if (path === '/lawyer/cases') { setRoute({ page: 'cases' }); }
    else if (path === '/lawyer/appointments') { setRoute({ page: 'appointments' }); }
    else if (path === '/lawyer/messages') { setRoute({ page: 'messages' }); }
    else if (path === '/lawyer/documents') { setRoute({ page: 'documents' }); }
    else if (path === '/lawyer/payments') { setRoute({ page: 'payments' }); }
    else if (path === '/lawyer/notifications') { setRoute({ page: 'notifications' }); }
    else if (path === '/lawyer/availability') { setRoute({ page: 'availability' }); }
    else if (path === '/lawyer/profile') { setRoute({ page: 'profile' }); }
    else if (path.startsWith('/lawyer/requests/')) { setRoute({ page: 'request-detail', requestId: path.split('/').pop()! }); }
    else if (path.startsWith('/lawyer/cases/')) { setRoute({ page: 'case-detail', caseId: path.split('/').pop()! }); }
    setMobileOpen(false);
  };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('nyaya-theme', next ? 'dark' : 'light');
  };

  const initials = (name: string) => name.split(' ').filter(w => !w.endsWith('.')).map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const navItems = [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/lawyer' },
    { page: 'requests', label: 'Case Requests', icon: InboxIcon, path: '/lawyer/requests', badge: newRequests },
    { page: 'cases', label: 'My Cases', icon: BriefcaseBusiness, path: '/lawyer/cases' },
    { page: 'appointments', label: 'Appointments', icon: CalendarDays, path: '/lawyer/appointments' },
    { page: 'messages', label: 'Messages', icon: MessageSquareText, path: '/lawyer/messages' },
    { page: 'documents', label: 'Documents', icon: FileText, path: '/lawyer/documents' },
    { page: 'payments', label: 'Payments', icon: CreditCard, path: '/lawyer/payments' },
    { page: 'notifications', label: 'Notifications', icon: Bell, path: '/lawyer/notifications', badge: unreadCount },
    { page: 'availability', label: 'Availability', icon: Clock, path: '/lawyer/availability' },
    { page: 'profile', label: 'Profile', icon: UserRound, path: '/lawyer/profile' },
  ];

  const currentPage = route.page === 'request-detail' ? 'requests' : route.page === 'case-detail' ? 'cases' : route.page;

  return (
    <div className="lp-shell">
      {/* Sidebar */}
      <aside className={`lp-sidebar ${mobileOpen ? 'lp-sidebar-open' : ''}`}>
        <div className="lp-sidebar-top">
          <div className="lp-brand">
            <span className="lp-brand-mark"><Scale size={20} strokeWidth={2.5} /></span>
            <span>nyaya</span>
          </div>
          <button className="lp-icon-btn lp-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="lp-workspace-switcher">
          <div className="lp-sidebar-avatar">{initials(user.fullName)}</div>
          <div>
            <strong>{user.fullName}</strong>
            <span>Lawyer workspace</span>
          </div>
          <ChevronDown size={15} />
        </div>

        <nav className="lp-nav" aria-label="Lawyer navigation">
          {navItems.map(item => (
            <button
              key={item.page}
              className={`lp-nav-item ${currentPage === item.page ? 'lp-nav-item-active' : ''}`}
              onClick={() => navigate(item.path)}
              data-testid={`lawyer-nav-${item.page}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="lp-nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="lp-sidebar-spacer" />

        <div className="lp-sidebar-user">
          <div className="lp-sidebar-avatar lp-avatar-teal">{initials(user.fullName)}</div>
          <div>
            <strong>{user.fullName}</strong>
            <span>Lawyer</span>
          </div>
          <button className="lp-icon-btn" title="Sign out" onClick={onSignOut} data-testid="lawyer-sign-out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="lp-scrim" onClick={() => setMobileOpen(false)} />}

      {/* Main Area */}
      <div className="lp-main">
        {/* Topbar */}
        <header className="lp-topbar">
          <button className="lp-icon-btn lp-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="lp-topbar-brand">
            <Scale size={18} strokeWidth={2.5} />
            <span>nyaya</span>
          </div>
          <div className="lp-topbar-right">
            <button
              className="lp-icon-btn lp-notif-btn"
              onClick={() => navigate('/lawyer/notifications')}
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && <span className="lp-notif-pip">{unreadCount}</span>}
            </button>
            <button className="lp-icon-btn" onClick={toggleDark} aria-label="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="lp-topbar-avatar">{initials(user.fullName)}</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="lp-content">
          {route.page === 'dashboard' && (
            <LawyerDashboard onNavigate={navigate} />
          )}
          {route.page === 'requests' && (
            <CaseRequests onViewRequest={id => setRoute({ page: 'request-detail', requestId: id })} />
          )}
          {route.page === 'request-detail' && (
            <CaseRequestDetail
              requestId={route.requestId}
              onBack={() => setRoute({ page: 'requests' })}
              onCaseAccepted={caseId => setRoute({ page: 'case-detail', caseId })}
            />
          )}
          {route.page === 'cases' && (
            <MyCases onOpenCase={id => setRoute({ page: 'case-detail', caseId: id })} />
          )}
          {route.page === 'case-detail' && (
            <CaseDetail
              caseId={route.caseId}
              onBack={() => setRoute({ page: 'cases' })}
            />
          )}
          {route.page === 'appointments' && <LawyerAppointments />}
          {route.page === 'messages' && <LawyerMessages />}
          {route.page === 'documents' && <LawyerDocuments />}
          {route.page === 'payments' && <LawyerPayments />}
          {route.page === 'notifications' && <LawyerNotifications />}
          {route.page === 'availability' && <LawyerAvailability />}
          {route.page === 'profile' && <LawyerProfile />}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

// ─── Public Shell Export ──────────────────────────────────────────────────────

export function LawyerShell({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
  return (
    <LawyerProvider>
      <LawyerShellInner user={user} onSignOut={onSignOut} />
    </LawyerProvider>
  );
}
