import React, { useState } from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminTopbar } from './components/AdminTopbar';
import { ToastContainer } from './components/Toast';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminLawyers } from './pages/AdminLawyers';
import { AdminReports } from './pages/AdminReports';
import { AdminNotifications } from './pages/AdminNotifications';
import { AdminAuditLogs } from './pages/AdminAuditLogs';
import { AdminSettings } from './pages/AdminSettings';
import { AdminProfile } from './pages/AdminProfile';
import './admin.css';
import type { UserRole } from './types';

interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

interface AdminShellProps {
  user: SessionUser;
  onSignOut: () => void;
}

const AdminShellInner: React.FC<AdminShellProps> = ({ user, onSignOut }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toasts, removeToast } = useAdmin();

  return (
    <div className="admin-shell">
      {/* Sidebar Navigation */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onSignOut={onSignOut}
        adminName={user.fullName}
      />

      {/* Main Viewport */}
      <div className="admin-main-viewport">
        <AdminTopbar
          onOpenMobile={() => setMobileOpen(true)}
          adminName={user.fullName}
        />

        <main className="admin-content-area">
          <Switch>
            <Route path="/" component={AdminDashboard} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route path="/admin/lawyers" component={AdminLawyers} />
            <Route path="/admin/reports" component={AdminReports} />
            <Route path="/admin/notifications" component={AdminNotifications} />
            <Route path="/admin/audit-logs" component={AdminAuditLogs} />
            <Route path="/admin/settings" component={AdminSettings} />
            <Route path="/admin/profile">
              {() => <AdminProfile adminName={user.fullName} adminEmail={user.email} />}
            </Route>
            {/* Fallback */}
            <Route>
              <Redirect to="/admin/dashboard" />
            </Route>
          </Switch>
        </main>
      </div>

      {/* Global Toast System */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export const AdminShell: React.FC<AdminShellProps> = (props) => {
  return (
    <AdminProvider currentAdminName={props.user.fullName} currentAdminId={`ADM00${props.user.id}`}>
      <AdminShellInner {...props} />
    </AdminProvider>
  );
};
