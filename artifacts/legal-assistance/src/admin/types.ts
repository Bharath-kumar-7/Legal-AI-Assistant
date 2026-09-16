export type UserRole = 'admin' | 'client' | 'lawyer';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ComplaintStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'ESCALATED';
export type ComplaintCategory = 'MISCONDUCT' | 'BILLING' | 'UNRESPONSIVE' | 'HARASSMENT' | 'DATA_PRIVACY' | 'OTHER';
export type NotificationAudience = 'ALL_USERS' | 'ALL_LAWYERS' | 'SPECIFIC_USERS' | 'SPECIFIC_LAWYERS';
export type NotificationPriority = 'NORMAL' | 'HIGH' | 'URGENT';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  role: 'client' | 'lawyer';
  status: AccountStatus;
  createdAt: string;
  lastLogin: string;
  suspensionReason?: string;
  deactivationReason?: string;
  suspensionHistory?: Array<{
    date: string;
    reason: string;
    actionBy: string;
    type: 'SUSPEND' | 'RESTORE' | 'DEACTIVATE';
  }>;
}

export interface VerificationDocument {
  id: string;
  title: string;
  type: 'PDF' | 'IMAGE';
  url: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
}

export interface AdminLawyerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  address: string;
  registrationNumber: string; // Bar Council Registration Number
  specialization: string;
  experienceYears: number;
  bio?: string;
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  rejectionReason?: string;
  suspensionReason?: string;
  deactivationReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  documents: VerificationDocument[];
}

export interface AdminComplaint {
  id: string;
  reportedBy: {
    id: string;
    name: string;
    role: UserRole;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string;
    role: UserRole;
    email: string;
  };
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  adminNotes?: string;
  assignedAdmin?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
  }>;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'CREATE_USER'
    | 'UPDATE_USER'
    | 'SUSPEND_USER'
    | 'RESTORE_USER'
    | 'DEACTIVATE_USER'
    | 'APPROVE_LAWYER'
    | 'REJECT_LAWYER'
    | 'SUSPEND_LAWYER'
    | 'RESTORE_LAWYER'
    | 'DEACTIVATE_LAWYER'
    | 'UPDATE_SETTINGS'
    | 'CREATE_NOTIFICATION'
    | 'RESOLVE_COMPLAINT'
    | 'REJECT_COMPLAINT'
    | 'WARN_ACCOUNT';
  entityType: 'USER' | 'LAWYER' | 'COMPLAINT' | 'SETTINGS' | 'NOTIFICATION' | 'AUTH';
  entityId: string;
  description: string;
  oldValue?: string | Record<string, unknown>;
  newValue?: string | Record<string, unknown>;
  reason?: string;
  timestamp: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  targetId?: string;
  priority: NotificationPriority;
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface PlatformSettings {
  general: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  users: {
    allowRegistration: boolean;
    maxCasesPerClient: number;
    requirePhoneVerification: boolean;
  };
  lawyers: {
    requireBarVerification: boolean;
    autoReviewGracePeriodDays: number;
    specializations: string[];
  };
  notifications: {
    emailNotificationsEnabled: boolean;
    smsAlertsEnabled: boolean;
    broadcastUrgentAlerts: boolean;
  };
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    deactivated: number;
  };
  lawyers: {
    total: number;
    active: number;
    pendingVerification: number;
    rejected: number;
    suspended: number;
  };
  reports: {
    pending: number;
    underReview: number;
    resolved: number;
  };
}
