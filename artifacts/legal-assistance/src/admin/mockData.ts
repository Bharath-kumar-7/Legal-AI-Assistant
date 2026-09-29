import type {
  AdminUser,
  AdminLawyerProfile,
  AdminComplaint,
  AdminAuditLog,
  AdminNotification,
  PlatformSettings,
} from './types';

// ─── Registered Clients ────────────────────────────────────────────────────────
export const initialUsers: AdminUser[] = [
  {
    id: 'USR101',
    name: 'Rahul Sharma',
    email: 'client@nyaya.in',
    phone: '+91 98765 43210',
    role: 'client',
    status: 'ACTIVE',
    createdAt: '2026-09-01T10:30:00Z',
    lastLogin: '2026-09-16T08:15:00Z',
  },
  {
    id: 'USR102',
    name: 'Pooja Verma',
    email: 'pooja.verma@example.com',
    phone: '+91 98111 22334',
    role: 'client',
    status: 'ACTIVE',
    createdAt: '2026-09-05T14:30:00Z',
    lastLogin: '2026-09-17T11:20:00Z',
  },
  {
    id: 'USR103',
    name: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    phone: '+91 99200 77889',
    role: 'client',
    status: 'ACTIVE',
    createdAt: '2026-09-10T11:15:00Z',
    lastLogin: '2026-09-18T16:45:00Z',
  },
];

// ─── Registered Advocates (Verified & Pending Queue) ──────────────────────────
export const initialLawyers: AdminLawyerProfile[] = [
  {
    id: 'LAW-000101',
    userId: '201',
    name: 'Adv. Rohan Iyer',
    email: 'lawyer@nyaya.in',
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
  {
    id: 'LAW-000102',
    userId: '202',
    name: 'Adv. Meera Sen',
    email: 'meera.sen@example.com',
    phone: '+91 98300 11223',
    address: 'Chamber 12, High Court Annex, Kolkata 700001',
    registrationNumber: 'WB/1204/2015',
    specialization: 'Criminal Law',
    experienceYears: 9,
    bio: 'Practicing advocate specializing in criminal defense, bail jurisprudence, and trial litigation before Calcutta High Court.',
    verificationStatus: 'APPROVED',
    accountStatus: 'ACTIVE',
    verifiedBy: 'ADM001',
    verifiedAt: '2026-09-02T11:00:00Z',
    createdAt: '2026-09-02T09:00:00Z',
    documents: [
      {
        id: 'DOC_L2_01',
        title: 'Bar Council of West Bengal Certificate',
        type: 'PDF',
        url: 'https://example.com/docs/bar-cert-meera.pdf',
        fileName: 'Bar_Council_Certificate_WB_1204.pdf',
        fileSize: '1.8 MB',
        uploadedAt: '2026-09-02T09:15:00Z',
      },
    ],
  },
  {
    id: 'LAW-000103',
    userId: '203',
    name: 'Adv. Rajesh Nair',
    email: 'rajesh.nair@example.com',
    phone: '+91 98450 77889',
    address: 'Level 5, Prestige Towers, MG Road, Bengaluru 560001',
    registrationNumber: 'KAR/3490/2010',
    specialization: 'Corporate Law',
    experienceYears: 14,
    bio: 'Senior corporate counsel handling founder agreements, trademark registration, and tech sector contractual disputes.',
    verificationStatus: 'APPROVED',
    accountStatus: 'ACTIVE',
    verifiedBy: 'ADM001',
    verifiedAt: '2026-09-03T15:00:00Z',
    createdAt: '2026-09-03T10:00:00Z',
    documents: [
      {
        id: 'DOC_L3_01',
        title: 'Karnataka State Bar Council Certificate',
        type: 'PDF',
        url: 'https://example.com/docs/bar-cert-rajesh.pdf',
        fileName: 'Bar_Council_Certificate_KAR_3490.pdf',
        fileSize: '2.1 MB',
        uploadedAt: '2026-09-03T10:30:00Z',
      },
    ],
  },
  {
    id: 'LAW-000104',
    userId: '204',
    name: 'Adv. Ananya Deshmukh',
    email: 'ananya.d@example.com',
    phone: '+91 97654 33221',
    address: 'Law Chambers, FC Road, Shivaji Nagar, Pune 411005',
    registrationNumber: 'MAH/6721/2017',
    specialization: 'Family Law',
    experienceYears: 7,
    bio: 'Dedicated advocate specializing in family mediation, divorce petitions, child custody, and domestic violence protections.',
    verificationStatus: 'APPROVED',
    accountStatus: 'ACTIVE',
    verifiedBy: 'ADM001',
    verifiedAt: '2026-09-04T16:00:00Z',
    createdAt: '2026-09-04T12:00:00Z',
    documents: [
      {
        id: 'DOC_L4_01',
        title: 'Bar Council Identity Card',
        type: 'PDF',
        url: 'https://example.com/docs/bar-cert-ananya.pdf',
        fileName: 'Bar_Council_Certificate_MAH_6721.pdf',
        fileSize: '1.2 MB',
        uploadedAt: '2026-09-04T12:20:00Z',
      },
    ],
  },
  {
    id: 'LAW-000105',
    userId: '205',
    name: 'Adv. Kabir Saxena',
    email: 'kabir.saxena@example.com',
    phone: '+91 98490 88990',
    address: 'Chamber 8, High Court Buildings, Hyderabad 500066',
    registrationNumber: 'TS/4102/2019',
    specialization: 'Cyber Law',
    experienceYears: 5,
    bio: 'Specialist in cyber fraud recovery, digital defamation, data privacy compliance, and IT Act representations.',
    verificationStatus: 'PENDING',
    accountStatus: 'ACTIVE',
    createdAt: '2026-09-15T15:00:00Z',
    documents: [
      {
        id: 'DOC_L5_01',
        title: 'Bar Council Enrollment Certificate',
        type: 'PDF',
        url: 'https://example.com/docs/bar-cert-kabir.pdf',
        fileName: 'Bar_Council_Certificate_TS_4102.pdf',
        fileSize: '1.6 MB',
        uploadedAt: '2026-09-15T15:10:00Z',
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
    audience: 'ALL_USERS',
    priority: 'NORMAL',
    startDate: '2026-09-16T08:00:00Z',
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
