import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { AdminLogin } from './pages/AdminLogin';
import type { UserRole } from './types';

interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

interface AdminRouteGuardProps {
  user: SessionUser | null;
  onAuthenticated: (user: SessionUser) => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  user,
  onAuthenticated,
  onSignOut,
  children,
}) => {
  // 1. Not Authenticated -> Show Admin Login
  if (!user) {
    return <AdminLogin onSuccess={onAuthenticated} />;
  }

  // 2. Authenticated but Role !== 'admin' -> 403 Forbidden / Boundary Notice
  if (user.role !== 'admin') {
    return (
      <div className="admin-forbidden-screen">
        <div className="forbidden-card">
          <div className="forbidden-icon-wrap">
            <ShieldAlert size={36} className="text-danger" />
          </div>
          <h2>403 — Unauthorized Access</h2>
          <p>
            Your current account (<strong>{user.email}</strong>, Role: <strong>{user.role}</strong>) does not have administrative privileges.
          </p>
          <div className="security-note">
            <small>
              Note: Frontend route guards are for navigation presentation. All administrative APIs enforce server-side cryptographic token verification.
            </small>
          </div>
          <div className="forbidden-actions">
            <a href="/" className="admin-btn admin-btn-secondary">
              <ArrowLeft size={16} /> Return to Client Workspace
            </a>
            <button type="button" className="admin-btn admin-btn-danger" onClick={onSignOut}>
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated + Role === 'admin' -> Allow Access
  return <>{children}</>;
};
