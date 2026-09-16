import type {
  LawyerProfile,
  CaseRequest,
  LawyerCase,
  CaseDocument,
  LawyerNote,
  CaseMessage,
  LawyerAppointment,
  LawyerPayment,
  LawyerEarnings,
  LawyerNotification,
  AvailabilitySlot,
  LawyerAuditEntry,
} from './types';

// ─── Single Sample Lawyer Profile (Showcase) ──────────────────────────────────
export const initialProfile: LawyerProfile = {
  lawyerId: 'LAW-000101',
  userId: '2',
  fullName: 'Adv. Rohan Iyer',
  email: 'rohan.iyer@iyerassociates.in',
  phone: '+91 98200 44556',
  location: 'Mumbai, Maharashtra',
  barCouncilNumber: 'MAH/4821/2012',
  barCouncilState: 'Bar Council of Maharashtra & Goa',
  yearsOfExperience: 12,
  practiceAreas: ['Civil Law', 'Property Law', 'Consumer Law', 'Commercial Law'],
  courtLocations: ['Bombay High Court', 'City Civil Court Mumbai', 'Consumer Forum'],
  languages: ['English', 'Hindi', 'Marathi'],
  bio: 'Specialist in property dispute resolution, consumer protection, and commercial arbitration before Bombay High Court. Over 12 years of litigation experience with a focus on practical, outcome-oriented legal strategy.',
  verificationStatus: 'VERIFIED',
  accountStatus: 'ACTIVE',
  verificationMessage: 'Your bar credentials have been verified by the Administrator. Your account is fully active.',
  createdAt: '2026-09-01T10:00:00Z',
};

// ─── Single Sample Client Profile ─────────────────────────────────────────────
const clientRahul = {
  clientId: '3',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@email.com',
  phone: '+91 98765 43210',
  location: 'Pune, Maharashtra',
};

// ─── Single Sample Case Request ───────────────────────────────────────────────
export const initialCaseRequests: CaseRequest[] = [
  {
    requestId: 'REQ-2026-001',
    caseId: 'CASE-10024',
    client: clientRahul,
    caseTitle: 'Property boundary dispute with neighbour',
    caseCategory: 'Property Law',
    description:
      'My neighbour has encroached approximately 2 feet of my registered property boundary and has begun construction. I have a sale deed from 2018 and recent survey report confirming the boundary. All verbal requests to stop have been ignored.',
    oppositeParty: 'Ramesh Kumar (Neighbour)',
    location: 'Pune, Maharashtra',
    relevantDates: 'Construction began: 15 July 2026. Survey report: 20 July 2026.',
    preferredConsultation: 'VIDEO',
    status: 'ACCEPTED',
    requestedAt: '2026-09-07T10:30:00Z',
    decidedAt: '2026-09-08T09:00:00Z',
    documents: [
      {
        docId: 'DOC-R001',
        caseId: 'CASE-10024',
        name: 'Property Sale Deed 2018',
        fileName: 'Sale_Deed_2018.pdf',
        fileType: 'PDF',
        fileSize: '2.4 MB',
        category: 'CLIENT_DOCUMENT',
        uploadedBy: 'CLIENT',
        uploadedByName: 'Rahul Sharma',
        uploadedAt: '2026-09-07T10:35:00Z',
        url: 'https://example.com/docs/sale-deed.pdf',
      },
      {
        docId: 'DOC-R002',
        caseId: 'CASE-10024',
        name: 'Survey Report — July 2026',
        fileName: 'Survey_Report_July2026.pdf',
        fileType: 'PDF',
        fileSize: '1.8 MB',
        category: 'CLIENT_DOCUMENT',
        uploadedBy: 'CLIENT',
        uploadedByName: 'Rahul Sharma',
        uploadedAt: '2026-09-07T10:36:00Z',
        url: 'https://example.com/docs/survey-report.pdf',
      },
    ],
    infoRequests: [],
  },
];

// ─── Single Sample Active Case ────────────────────────────────────────────────
const caseMessages: CaseMessage[] = [
  {
    messageId: 'MSG-001',
    caseId: 'CASE-10024',
    senderId: '3',
    senderRole: 'CLIENT',
    senderName: 'Rahul Sharma',
    text: 'Good morning Sir, I have uploaded the property survey map and sale deed.',
    sentAt: '2026-09-08T10:00:00Z',
    readAt: '2026-09-08T10:15:00Z',
  },
  {
    messageId: 'MSG-002',
    caseId: 'CASE-10024',
    senderId: '2',
    senderRole: 'LAWYER',
    senderName: 'Adv. Rohan Iyer',
    text: 'Received Rahul ji. The boundaries in survey 104 are clear. I am drafting a legal notice to halt any unauthorized construction.',
    sentAt: '2026-09-08T11:20:00Z',
  },
];

const caseNotes: LawyerNote[] = [
  {
    noteId: 'NOTE-001',
    caseId: 'CASE-10024',
    title: 'Prima Facie Case Strategy',
    content:
      'Clear title confirmed under registered 2018 deed. Recommend serving formal Cease and Desist notice followed by injunction suit before Civil Judge Senior Division if construction persists.',
    isPrivate: true,
    createdAt: '2026-09-08T12:00:00Z',
    updatedAt: '2026-09-08T12:00:00Z',
  },
];

export const initialCases: LawyerCase[] = [
  {
    caseId: 'CASE-10024',
    caseNumber: 'CASE-10024',
    client: clientRahul,
    lawyerId: '2',
    caseTitle: 'Property boundary dispute with neighbour',
    caseCategory: 'Property Law',
    description:
      'Encroachment of 2.5 feet on the north boundary wall of survey number 104 by adjacent resident.',
    oppositeParty: 'Ramesh Kumar (Neighbour)',
    location: 'Pune, Maharashtra',
    currentStatus: 'ACTIVE',
    statusHistory: [
      {
        status: 'ASSIGNED',
        changedAt: '2026-09-08T09:00:00Z',
        changedBy: 'Adv. Rohan Iyer',
        notes: 'Case accepted following conflict check.',
      },
      {
        status: 'ACTIVE',
        changedAt: '2026-09-08T12:00:00Z',
        changedBy: 'Adv. Rohan Iyer',
        notes: 'Notice drafted and review in progress.',
      },
    ],
    createdAt: '2026-09-07T10:30:00Z',
    assignedAt: '2026-09-08T09:00:00Z',
    lastUpdatedAt: '2026-09-08T12:00:00Z',
    documents: [
      {
        docId: 'DOC-R001',
        caseId: 'CASE-10024',
        name: 'Property Sale Deed 2018',
        fileName: 'Sale_Deed_2018.pdf',
        fileType: 'PDF',
        fileSize: '2.4 MB',
        category: 'CLIENT_DOCUMENT',
        uploadedBy: 'CLIENT',
        uploadedByName: 'Rahul Sharma',
        uploadedAt: '2026-09-07T10:35:00Z',
      },
    ],
    notes: caseNotes,
    messages: caseMessages,
    appointments: [
      {
        appointmentId: 'APPT-2026-001',
        caseId: 'CASE-10024',
        client: clientRahul,
        date: '2026-09-21',
        time: '11:30 AM',
        type: 'VIDEO',
        status: 'CONFIRMED',
        fee: 1800,
        meetingLink: 'https://meet.google.com/nya-law-meet',
        createdAt: '2026-09-08T10:00:00Z',
      },
    ],
    payments: [
      {
        paymentId: 'PAY-2026-001',
        caseId: 'CASE-10024',
        clientName: 'Rahul Sharma',
        amount: 1800,
        status: 'PAID',
        type: 'CONSULTATION',
        date: '2026-09-08T10:05:00Z',
        receiptNumber: 'REC-2026-001',
      },
    ],
  },
];

// ─── Single Sample Appointment ────────────────────────────────────────────────
export const initialAppointments: LawyerAppointment[] = [
  {
    appointmentId: 'APPT-2026-001',
    caseId: 'CASE-10024',
    caseTitle: 'Property boundary dispute with neighbour',
    client: clientRahul,
    date: '2026-09-21',
    time: '11:30 AM',
    type: 'VIDEO',
    status: 'CONFIRMED',
    fee: 1800,
    meetingLink: 'https://meet.google.com/nya-law-meet',
    createdAt: '2026-09-08T10:00:00Z',
  },
];

// ─── Single Sample Payment & Earnings ─────────────────────────────────────────
export const initialPayments: LawyerPayment[] = [
  {
    paymentId: 'PAY-2026-001',
    caseId: 'CASE-10024',
    caseTitle: 'Property boundary dispute with neighbour',
    clientName: 'Rahul Sharma',
    amount: 1800,
    status: 'PAID',
    type: 'CONSULTATION',
    date: '2026-09-08T10:05:00Z',
    receiptNumber: 'REC-2026-001',
  },
];

export const initialEarnings: LawyerEarnings = {
  totalEarnings: 1800,
  pendingEarnings: 0,
  thisMonth: 1800,
  lastMonth: 0,
  completedPayments: 1,
  refundedAmount: 0,
};

// ─── Single Sample Notification ───────────────────────────────────────────────
export const initialNotifications: LawyerNotification[] = [
  {
    notificationId: 'NOTIF-001',
    type: 'NEW_CASE_REQUEST',
    source: 'CLIENT',
    title: 'New Case Request',
    message: 'Rahul Sharma has requested legal assistance for a Property Boundary Dispute.',
    relatedCaseId: 'CASE-10024',
    relatedCaseTitle: 'Property boundary dispute with neighbour',
    senderName: 'Rahul Sharma',
    isRead: false,
    createdAt: '2026-09-07T10:30:00Z',
  },
];

// ─── Weekly Availability Slots ────────────────────────────────────────────────
export const initialAvailability: AvailabilitySlot[] = [
  { slotId: 'SLOT-1', day: 'MONDAY', startTime: '10:00', endTime: '18:00', isAvailable: true },
  { slotId: 'SLOT-2', day: 'TUESDAY', startTime: '10:00', endTime: '18:00', isAvailable: true },
  { slotId: 'SLOT-3', day: 'WEDNESDAY', startTime: '10:00', endTime: '18:00', isAvailable: true },
  { slotId: 'SLOT-4', day: 'THURSDAY', startTime: '10:00', endTime: '18:00', isAvailable: true },
  { slotId: 'SLOT-5', day: 'FRIDAY', startTime: '10:00', endTime: '17:00', isAvailable: true },
  { slotId: 'SLOT-6', day: 'SATURDAY', startTime: '10:00', endTime: '14:00', isAvailable: false },
  { slotId: 'SLOT-7', day: 'SUNDAY', startTime: '10:00', endTime: '13:00', isAvailable: false },
];

// ─── Audit Log (Clean) ────────────────────────────────────────────────────────
export const initialAuditLog: LawyerAuditEntry[] = [
  {
    entryId: 'AUD-001',
    lawyerId: '2',
    action: 'CASE_ACCEPTED',
    entityType: 'CASE',
    entityId: 'CASE-10024',
    description: 'Accepted case request from Rahul Sharma following conflict check.',
    timestamp: '2026-09-08T09:00:00Z',
  },
];
