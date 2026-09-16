import React from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string; count?: number }> = ({
  message = 'Loading administrative data...',
  count = 4,
}) => {
  return (
    <div className="admin-loading-wrapper">
      <div className="admin-loading-spinner">
        <RefreshCw size={24} className="spin-animate" />
      </div>
      <p className="loading-text">{message}</p>
      <div className="admin-skeleton-stack">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="admin-skeleton-line" />
        ))}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, description, action, icon }) => {
  return (
    <div className="admin-empty-state">
      <div className="empty-icon-wrap">{icon || <Inbox size={32} />}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="empty-actions">{action}</div>}
    </div>
  );
};

export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'Unable to load data. Please verify connectivity.', onRetry }) => {
  return (
    <div className="admin-error-state">
      <AlertCircle size={28} className="error-state-icon" />
      <h3>Operation Failed</h3>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="admin-btn admin-btn-secondary" onClick={onRetry}>
          <RefreshCw size={15} /> Try Again
        </button>
      )}
    </div>
  );
};
