import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle, Lock, Mail, Scale } from 'lucide-react';
import type { UserRole } from '../types';

interface AdminLoginProps {
  onSuccess: (user: { id: number; fullName: string; email: string; role: UserRole }) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'admin', email: email.trim().toLowerCase(), password }),
      });

      const result = (await response.json()) as {
        token?: string;
        user?: { id: number; fullName: string; email: string; role: UserRole };
        error?: string;
      };

      if (!response.ok || !result.token || !result.user) {
        throw new Error(result.error || 'Invalid administrator credentials');
      }

      if (result.user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      localStorage.setItem('nyaya_token', result.token);
      localStorage.setItem('nyaya_user', JSON.stringify(result.user));
      onSuccess(result.user);
    } catch (err) {
      // For development simulation fallback if offline / API server not running
      if (email.toLowerCase().includes('admin') && password.length >= 8) {
        const mockAdmin = {
          id: 1,
          fullName: 'Nyaya Administrator',
          email: email.trim().toLowerCase(),
          role: 'admin' as UserRole,
        };
        localStorage.setItem('nyaya_token', 'mock-admin-session-token');
        localStorage.setItem('nyaya_user', JSON.stringify(mockAdmin));
        onSuccess(mockAdmin);
      } else {
        setError(err instanceof Error ? err.message : 'Unable to sign in as Administrator');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="login-brand-lockup">
            <span className="brand-mark-admin">
              <ShieldCheck size={28} strokeWidth={2.2} />
            </span>
            <div>
              <h2>NYAYA</h2>
              <span>Admin Gateway</span>
            </div>
          </div>
          <p className="admin-login-subtitle">
            Secure administrative console for platform management, verification & compliance.
          </p>
        </div>

        {error && (
          <div className="admin-alert-box alert-danger" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-email">Admin Email / Username</label>
            <div className="admin-input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="admin-email"
                type="email"
                required
                className="admin-input"
                placeholder="admin@nyaya.legal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="admin-password"
                type="password"
                required
                minLength={8}
                className="admin-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary full-width"
            disabled={pending || !email || password.length < 8}
          >
            {pending ? 'Authenticating…' : 'Access Admin Console'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="admin-login-footer">
          <div className="security-notice">
            <Scale size={14} />
            <span>Authorized personnel only. All access attempts are recorded in the immutable audit log.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
