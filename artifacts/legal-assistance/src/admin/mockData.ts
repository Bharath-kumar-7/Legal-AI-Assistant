import type {
  AdminUser,
  AdminLawyerProfile,
  AdminComplaint,
  AdminAuditLog,
  AdminNotification,
  PlatformSettings,
} from './types';

// ─── Single Sample Client for Showcase ────────────────────────────────────────
export const initialUsers: AdminUser[] = [
  {
    id: 'USR3',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    role: 'client',
    status: 'ACTIVE',
    createdAt: '2026-09-01T10:30:00Z',
    lastLogin: '2026-09-16T08:15:00Z',
  },
];

// ─── Single Sample Verified Lawyer for Showcase ──────────────────────────────
export const initialLawyers: AdminLawyerProfile[] = [
  {
    id: 'LAW-000101',
    userId: '2',
    name: 'Adv. Rohan Iyer',
    email: 'rohan.iyer@iyerassociates.in',
    phone: '+91 98200 44556',
    address: 'Suite 402, High Court Chambers, Fort, Mumbai 400001',
    registrationNumber: 'MAH/4821/2012',
    specialization: 'Civil Law',
    experienceYears: 12,
    bio: 'Specialist in property dispute resolution, consumer protection, and commercial arbitration before Bombay High Court.',
    verificationStatus: 'APPROVED',
    accountStatus: 'ACTIVE',
    verifiedBy: 'ADM001',
    verifiedAt: '2026-09-01T14:30:00Z',
    createdAt: '2026-09-01T10:00:00Z',
    documents: [
      {
        id: 'DOC_L1_01',
        title: 'Bar Council of Maharashtra & Goa Certificate',
        type: 'PDF',
        url: 'https://example.com/docs/bar-cert-rohan.pdf',
        fileName: 'Bar_Council_Certificate_MAH_4821.pdf',
        fileSize: '1.4 MB',
        uploadedAt: '2026-09-01T10:05:00Z',
      },
    ],
  },
];

// ─── Complaints (Clean) ───────────────────────────────────────────────────────
export const initialComplaints: AdminComplaint[] = [];

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const initialAuditLogs: AdminAuditLog[] = [
  {
    id: 'AUD001',
    timestamp: '2026-09-01T14:30:00Z',
    adminId: 'ADM001',
    adminName: 'Chief Administrator',
    action: 'APPROVE_LAWYER',
    entityType: 'LAWYER',
    entityId: 'LAW-000101',
    description: 'Verified bar credentials for Adv. Rohan Iyer (Reg: MAH/4821/2012).',
    newValue: { status: 'APPROVED' },
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const initialNotifications: AdminNotification[] = [
  {
    id: 'NTF001',
    title: 'Platform System Ready',
    message: 'PostgreSQL database connected and security verification active.',
    audience: 'ALL',
    category: 'MAINTENANCE',
    isActive: true,
    createdAt: '2026-09-16T08:00:00Z',
    createdBy: 'ADM001',
  },
];

// ─── Platform Settings ────────────────────────────────────────────────────────
export const initialSettings: PlatformSettings = {
  general: {
    platformName: 'Nyaya — AI Legal Assistance Platform',
    supportEmail: 'support@nyaya.in',
    supportPhone: '+91 1800 200 4567',
    maintenanceMode: false,
    maintenanceMessage: 'Platform is undergoing routine maintenance.',
  },
  users: {
    allowRegistration: true,
    maxCasesPerClient: 20,
    requirePhoneVerification: false,
  },
  lawyers: {
    requireBarVerification: true,
    autoReviewGracePeriodDays: 7,
    specializations: [
      'Civil Law',
      'Property Law',
      'Criminal Law',
      'Corporate Law',
      'Family Law',
      'Consumer Law',
      'Cyber Law',
      'Labor Law',
      'Taxation Law',
      'Constitutional Law',
    ],
  },
  notifications: {
    emailNotificationsEnabled: true,
    smsAlertsEnabled: false,
    broadcastUrgentAlerts: true,
  },
};
