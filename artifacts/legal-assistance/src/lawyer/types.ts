// ─── Enums / Union Types ─────────────────────────────────────────────────────

export type LawyerVerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
export type LawyerAccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'DEACTIVATED';

export type CaseRequestStatus = 'PENDING' | 'INFO_REQUESTED' | 'ACCEPTED' | 'REJECTED';
export type AssignmentStatus = 'REQUESTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export type CaseStatus =
  | 'ASSIGNED'
  | 'CONSULTATION_SCHEDULED'
  | 'DOCUMENTS_PENDING'
  | 'UNDER_REVIEW'
  | 'LEGAL_NOTICE'
  | 'COURT_FILING'
  | 'HEARING'
  | 'RESOLVED'
  | 'CLOSED';

export type AppointmentType = 'VIDEO' | 'OFFICE';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentType = 'CONSULTATION' | 'CASE_FEE' | 'RETAINER' | 'COURT_FILING';

export type NotificationSource = 'CLIENT' | 'ADMIN' | 'SYSTEM';
export type NotificationType =
  | 'NEW_CASE_REQUEST'
  | 'DOCUMENT_UPLOADED'
  | 'NEW_MESSAGE'
  | 'APPOINTMENT_REQUEST'
  | 'APPOINTMENT_CHANGE'
  | 'CASE_UPDATED'
  | 'VERIFICATION_RESULT'
  | 'PLATFORM_ANNOUNCEMENT'
  | 'PAYMENT_RECEIVED'
  | 'ACCOUNT_STATUS_CHANGE'
  | 'UPCOMING_APPOINTMENT';

export type DocumentUploadedBy = 'CLIENT' | 'LAWYER' | 'COURT';
export type DocumentCategory = 'CLIENT_DOCUMENT' | 'LAWYER_DOCUMENT' | 'COURT_DOCUMENT' | 'EVIDENCE' | 'NOTICE' | 'AGREEMENT';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PROFILE_UPDATED'
  | 'CASE_ACCEPTED'
  | 'CASE_REJECTED'
  | 'INFO_REQUESTED'
  | 'CASE_STATUS_UPDATED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_DELETED'
  | 'NOTE_ADDED'
  | 'NOTE_UPDATED'
  | 'NOTE_DELETED'
  | 'MESSAGE_SENT'
  | 'APPOINTMENT_ACCEPTED'
  | 'APPOINTMENT_REJECTED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_COMPLETED'
  | 'AVAILABILITY_UPDATED';

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface LawyerProfile {
  lawyerId: string; // e.g. LAW-000001
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  location: string;
  barCouncilNumber: string;
  barCouncilState: string;
  yearsOfExperience: number;
  practiceAreas: string[];
  courtLocations: string[];
  languages: string[];
  bio: string;
  verificationStatus: LawyerVerificationStatus;
  accountStatus: LawyerAccountStatus;
  verificationMessage?: string; // Admin message
  createdAt: string;
}

// ─── Case Request ─────────────────────────────────────────────────────────────

export interface CaseRequestClient {
  clientId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface CaseRequest {
  requestId: string;
  caseId: string;
  client: CaseRequestClient;
  caseTitle: string;
  caseCategory: string;
  description: string;
  oppositeParty: string;
  location: string;
  relevantDates: string;
  preferredConsultation: AppointmentType;
  status: CaseRequestStatus;
  requestedAt: string;
  documents: CaseDocument[];
  infoRequests: InfoRequest[]; // Lawyer's requests for more info
}

export interface InfoRequest {
  id: string;
  message: string;
  sentAt: string;
  clientResponse?: string;
  respondedAt?: string;
}

// ─── Case ─────────────────────────────────────────────────────────────────────

export interface CaseStatusHistoryEntry {
  id: string;
  previousStatus: CaseStatus;
  newStatus: CaseStatus;
  changedAt: string;
  changedBy: string; // lawyer ID
  note?: string;
}

export interface LawyerCase {
  caseId: string;
  caseNumber: string; // e.g. CASE-10025
  client: CaseRequestClient;
  lawyerId: string;
  caseTitle: string;
  caseCategory: string;
  description: string;
  oppositeParty: string;
  location: string;
  currentStatus: CaseStatus;
  statusHistory: CaseStatusHistoryEntry[];
  createdAt: string;
  assignedAt: string;
  lastUpdatedAt: string;
  closedAt?: string;
  documents: CaseDocument[];
  notes: LawyerNote[];
  messages: CaseMessage[];
  appointments: LawyerAppointment[];
  payments: LawyerPayment[];
}

// ─── Documents ────────────────────────────────────────────────────────────────

export interface CaseDocument {
  docId: string;
  caseId: string;
  name: string;
  fileName: string;
  fileType: string; // PDF, IMAGE, DOCX, AUDIO, VIDEO, OTHER
  fileSize: string;
  category: DocumentCategory;
  uploadedBy: DocumentUploadedBy;
  uploadedByName: string;
  uploadedAt: string;
  url?: string; // preview/download URL
  description?: string;
}

// ─── Lawyer Notes (Private) ───────────────────────────────────────────────────

export interface LawyerNote {
  noteId: string;
  caseId: string;
  lawyerId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface CaseMessage {
  messageId: string;
  caseId: string;
  senderId: string;
  senderRole: 'CLIENT' | 'LAWYER';
  senderName: string;
  text: string;
  attachments?: CaseDocument[];
  sentAt: string;
  readAt?: string;
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export interface LawyerAppointment {
  appointmentId: string;
  caseId: string;
  caseTitle: string;
  client: CaseRequestClient;
  type: AppointmentType;
  date: string;
  time: string;
  status: AppointmentStatus;
  fee: number;
  notes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface LawyerPayment {
  paymentId: string;
  caseId: string;
  caseTitle: string;
  clientName: string;
  type: PaymentType;
  amount: number;
  date: string;
  status: PaymentStatus;
  receiptNumber: string;
  refundAmount?: number;
  refundedAt?: string;
}

export interface LawyerEarnings {
  totalEarnings: number;
  pendingEarnings: number;
  completedPayments: number;
  refundedAmount: number;
  thisMonth: number;
  lastMonth: number;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface LawyerNotification {
  notificationId: string;
  type: NotificationType;
  source: NotificationSource;
  title: string;
  message: string;
  relatedCaseId?: string;
  relatedCaseTitle?: string;
  senderName: string;
  createdAt: string;
  isRead: boolean;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface AvailabilitySlot {
  slotId: string;
  day: DayOfWeek;
  startTime: string; // HH:MM 24h
  endTime: string;
  isAvailable: boolean;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface LawyerAuditEntry {
  entryId: string;
  lawyerId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ─── Context State ────────────────────────────────────────────────────────────

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
