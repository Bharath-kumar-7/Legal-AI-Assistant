import React from 'react';
import type { AccountStatus, VerificationStatus, ComplaintStatus, NotificationPriority } from '../types';

interface StatusBadgeProps {
  status: AccountStatus | VerificationStatus | ComplaintStatus | NotificationPriority | string;
  type?: 'account' | 'verification' | 'complaint' | 'priority' | 'generic';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'generic' }) => {
  let badgeClass = 'admin-badge-neutral';
  let label = status;

  switch (status) {
    // Verification
    case 'APPROVED':
      badgeClass = 'admin-badge-success';
      label = 'Approved';
      break;
    case 'PENDING':
      badgeClass = 'admin-badge-warning';
      label = 'Pending Review';
      break;
    case 'REJECTED':
      badgeClass = 'admin-badge-danger';
      label = 'Rejected';
      break;

    // Account Status
    case 'ACTIVE':
      badgeClass = 'admin-badge-success';
      label = 'Active';
      break;
    case 'SUSPENDED':
      badgeClass = 'admin-badge-warning';
      label = 'Suspended';
      break;
    case 'DEACTIVATED':
      badgeClass = 'admin-badge-danger';
      label = 'Deactivated (Soft Delete)';
      break;

    // Complaints
    case 'UNDER_REVIEW':
      badgeClass = 'admin-badge-info';
      label = 'Under Review';
      break;
    case 'RESOLVED':
      badgeClass = 'admin-badge-success';
      label = 'Resolved';
      break;
    case 'ESCALATED':
      badgeClass = 'admin-badge-danger';
      label = 'Escalated';
      break;

    // Priority
    case 'URGENT':
      badgeClass = 'admin-badge-danger';
      label = 'Urgent';
      break;
    case 'HIGH':
      badgeClass = 'admin-badge-warning';
      label = 'High Priority';
      break;
    case 'NORMAL':
      badgeClass = 'admin-badge-neutral';
      label = 'Normal';
      break;
    default:
      badgeClass = 'admin-badge-neutral';
      label = String(status);
  }

  return (
    <span className={`admin-badge ${badgeClass}`} title={`${type}: ${status}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
};
