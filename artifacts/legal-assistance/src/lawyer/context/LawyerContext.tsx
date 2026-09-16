import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  ToastItem,
  CaseStatus,
  AppointmentStatus,
} from '../types';
import {
  initialProfile,
  initialCaseRequests,
  initialCases,
  initialAppointments,
  initialPayments,
  initialEarnings,
  initialNotifications,
  initialAvailability,
  initialAuditLog,
} from '../mockData';

// ─── Context Interface ────────────────────────────────────────────────────────

interface LawyerContextValue {
  // Profile
  profile: LawyerProfile;
  updateProfile: (updates: Partial<LawyerProfile>) => void;

  // Case Requests
  caseRequests: CaseRequest[];
  acceptCaseRequest: (requestId: string, conflictConfirmed: boolean) => void;
  rejectCaseRequest: (requestId: string, reason: string) => void;
  requestMoreInfo: (requestId: string, message: string) => void;

  // Cases
  cases: LawyerCase[];
  updateCaseStatus: (caseId: string, newStatus: CaseStatus, note?: string) => void;

  // Documents
  uploadDocument: (caseId: string, doc: Omit<CaseDocument, 'docId' | 'uploadedAt'>) => void;
  deleteDocument: (caseId: string, docId: string) => void;

  // Notes
  addNote: (caseId: string, note: Omit<LawyerNote, 'noteId' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (caseId: string, noteId: string, updates: Partial<Pick<LawyerNote, 'title' | 'content'>>) => void;
  deleteNote: (caseId: string, noteId: string) => void;

  // Messages
  sendMessage: (caseId: string, text: string) => void;

  // Appointments
  appointments: LawyerAppointment[];
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus, note?: string) => void;

  // Payments
  payments: LawyerPayment[];
  earnings: LawyerEarnings;

  // Notifications
  notifications: LawyerNotification[];
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;

  // Availability
  availability: AvailabilitySlot[];
  updateAvailability: (slots: AvailabilitySlot[]) => void;

  // Audit
  auditLog: LawyerAuditEntry[];

  // Toast
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LawyerContext = createContext<LawyerContextValue | null>(null);

export function useLawyer() {
  const ctx = useContext(LawyerContext);
  if (!ctx) throw new Error('useLawyer must be used inside LawyerProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LawyerProvider({ children }: { children: React.ReactNode }) {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('nyaya_user') || '{}');
    } catch {
      return {};
    }
  })();
  const isSampleLawyer = currentUser.email === 'rohan.iyer@iyerassociates.in';

  const defaultNewProfile: LawyerProfile = {
    lawyerId: `LAW-${String(currentUser.id || 'NEW').padStart(6, '0')}`,
    userId: String(currentUser.id || ''),
    fullName: currentUser.fullName || 'Advocate',
    email: currentUser.email || '',
    phone: '',
    location: 'India',
    barCouncilNumber: 'PENDING VERIFICATION',
    barCouncilState: 'State Bar Council',
    yearsOfExperience: 0,
    practiceAreas: ['General Practice'],
    courtLocations: ['District Courts'],
    languages: ['English'],
    bio: 'Profile awaiting administrative verification.',
    verificationStatus: 'PENDING',
    accountStatus: 'ACTIVE',
    verificationMessage: 'Your account is under review by the Platform Administrator.',
    createdAt: new Date().toISOString(),
  };

  const [profile, setProfile] = useState<LawyerProfile>(isSampleLawyer ? initialProfile : defaultNewProfile);
  const [caseRequests, setCaseRequests] = useState<CaseRequest[]>(isSampleLawyer ? initialCaseRequests : []);
  const [cases, setCases] = useState<LawyerCase[]>(isSampleLawyer ? initialCases : []);
  const [appointments, setAppointments] = useState<LawyerAppointment[]>(isSampleLawyer ? initialAppointments : []);
  const [payments] = useState<LawyerPayment[]>(isSampleLawyer ? initialPayments : []);
  const [earnings] = useState<LawyerEarnings>(
    isSampleLawyer
      ? initialEarnings
      : {
          totalEarnings: 0,
          pendingEarnings: 0,
          thisMonth: 0,
          lastMonth: 0,
          completedPayments: 0,
          refundedAmount: 0,
        }
  );
  const [notifications, setNotifications] = useState<LawyerNotification[]>(isSampleLawyer ? initialNotifications : []);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(initialAvailability);
  const [auditLog, setAuditLog] = useState<LawyerAuditEntry[]>(isSampleLawyer ? initialAuditLog : []);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // ─── Real Database Hydration ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('nyaya_token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    fetch('/api/lawyer/profile', { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.lawyerId) setProfile((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});

    fetch('/api/lawyer/case-requests', { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          if (!isSampleLawyer || data.length > 0) setCaseRequests(data);
        }
      })
      .catch(() => {});

    fetch('/api/lawyer/cases', { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          if (!isSampleLawyer || data.length > 0) setCases(data);
        }
      })
      .catch(() => {});

    fetch('/api/lawyer/appointments', { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          if (!isSampleLawyer || data.length > 0) setAppointments(data);
        }
      })
      .catch(() => {});

    fetch('/api/lawyer/notifications', { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          if (!isSampleLawyer || data.length > 0) setNotifications(data);
        }
      })
      .catch(() => {});

    fetch('/api/lawyer/availability', { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAvailability(data);
      })
      .catch(() => {});
  }, [isSampleLawyer]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const appendAudit = useCallback((entry: Omit<LawyerAuditEntry, 'entryId' | 'lawyerId' | 'timestamp'>) => {
    setAuditLog(prev => [
      {
        ...entry,
        entryId: `AUDIT-${Date.now()}`,
        lawyerId: profile.userId,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, [profile.userId]);

  const addNotification = useCallback((notif: Omit<LawyerNotification, 'notificationId' | 'createdAt' | 'isRead'>) => {
    setNotifications(prev => [
      {
        ...notif,
        notificationId: `NTF-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      ...prev,
    ]);
  }, []);

  // ─── Profile ───────────────────────────────────────────────────────────────

  const updateProfile = useCallback((updates: Partial<LawyerProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    appendAudit({
      action: 'PROFILE_UPDATED',
      entityType: 'PROFILE',
      entityId: profile.lawyerId,
      description: 'Lawyer updated their profile information.',
    });
    addToast('Profile updated successfully.');
  }, [appendAudit, addToast, profile.lawyerId]);

  // ─── Case Requests ─────────────────────────────────────────────────────────

  const acceptCaseRequest = useCallback((requestId: string, _conflictConfirmed: boolean) => {
    setCaseRequests(prev =>
      prev.map(r => r.requestId === requestId ? { ...r, status: 'ACCEPTED' } : r)
    );
    const req = caseRequests.find(r => r.requestId === requestId);
    if (req) {
      // Add the case to active cases
      const newCase: LawyerCase = {
        caseId: req.caseId,
        caseNumber: req.caseId,
        client: req.client,
        lawyerId: profile.userId,
        caseTitle: req.caseTitle,
        caseCategory: req.caseCategory,
        description: req.description,
        oppositeParty: req.oppositeParty,
        location: req.location,
        currentStatus: 'ASSIGNED',
        statusHistory: [],
        createdAt: req.requestedAt,
        assignedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        documents: req.documents,
        notes: [],
        messages: [],
        appointments: [],
        payments: [],
      };
      setCases(prev => [newCase, ...prev]);
      addNotification({
        type: 'CASE_UPDATED',
        source: 'SYSTEM',
        title: 'Case accepted',
        message: `You have accepted the case "${req.caseTitle}" from ${req.client.name}.`,
        relatedCaseId: req.caseId,
        relatedCaseTitle: req.caseTitle,
        senderName: 'Nyaya System',
      });
      appendAudit({
        action: 'CASE_ACCEPTED',
        entityType: 'CASE_REQUEST',
        entityId: requestId,
        description: `Lawyer accepted case request ${requestId} (${req.client.name} — ${req.caseTitle}).`,
      });
      addToast(`Case "${req.caseTitle}" accepted.`);
    }
  }, [caseRequests, profile.userId, addNotification, appendAudit, addToast]);

  const rejectCaseRequest = useCallback((requestId: string, reason: string) => {
    setCaseRequests(prev =>
      prev.map(r => r.requestId === requestId ? { ...r, status: 'REJECTED' } : r)
    );
    const req = caseRequests.find(r => r.requestId === requestId);
    appendAudit({
      action: 'CASE_REJECTED',
      entityType: 'CASE_REQUEST',
      entityId: requestId,
      description: `Lawyer rejected case request ${requestId}. Reason: ${reason}`,
    });
    addToast(`Case request rejected.`, 'info');
    if (req) {
      addNotification({
        type: 'CASE_UPDATED',
        source: 'SYSTEM',
        title: 'Case request rejected',
        message: `You rejected the case "${req.caseTitle}" from ${req.client.name}. Reason: ${reason}`,
        relatedCaseId: req.caseId,
        relatedCaseTitle: req.caseTitle,
        senderName: 'Nyaya System',
      });
    }
  }, [caseRequests, appendAudit, addToast, addNotification]);

  const requestMoreInfo = useCallback((requestId: string, message: string) => {
    setCaseRequests(prev =>
      prev.map(r =>
        r.requestId === requestId
          ? {
              ...r,
              status: 'INFO_REQUESTED',
              infoRequests: [
                ...r.infoRequests,
                {
                  id: `IR-${Date.now()}`,
                  message,
                  sentAt: new Date().toISOString(),
                },
              ],
            }
          : r
      )
    );
    appendAudit({
      action: 'INFO_REQUESTED',
      entityType: 'CASE_REQUEST',
      entityId: requestId,
      description: `Lawyer requested additional information: "${message}"`,
    });
    addToast('Information request sent to client.', 'info');
  }, [appendAudit, addToast]);

  // ─── Cases ─────────────────────────────────────────────────────────────────

  const updateCaseStatus = useCallback((caseId: string, newStatus: CaseStatus, note?: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.caseId !== caseId) return c;
        const historyEntry = {
          id: `SH-${Date.now()}`,
          previousStatus: c.currentStatus,
          newStatus,
          changedAt: new Date().toISOString(),
          changedBy: profile.userId,
          note,
        };
        return {
          ...c,
          currentStatus: newStatus,
          statusHistory: [...c.statusHistory, historyEntry],
          lastUpdatedAt: new Date().toISOString(),
          ...(newStatus === 'CLOSED' || newStatus === 'RESOLVED' ? { closedAt: new Date().toISOString() } : {}),
        };
      })
    );
    appendAudit({
      action: 'CASE_STATUS_UPDATED',
      entityType: 'CASE',
      entityId: caseId,
      description: `Case status updated to ${newStatus} for ${caseId}${note ? `. Note: ${note}` : ''}.`,
    });
    addToast('Case status updated.');
  }, [profile.userId, appendAudit, addToast]);

  // ─── Documents ─────────────────────────────────────────────────────────────

  const uploadDocument = useCallback((caseId: string, doc: Omit<CaseDocument, 'docId' | 'uploadedAt'>) => {
    const newDoc: CaseDocument = {
      ...doc,
      docId: `DOC-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setCases(prev =>
      prev.map(c => c.caseId === caseId ? { ...c, documents: [...c.documents, newDoc], lastUpdatedAt: new Date().toISOString() } : c)
    );
    appendAudit({
      action: 'DOCUMENT_UPLOADED',
      entityType: 'DOCUMENT',
      entityId: newDoc.docId,
      description: `Uploaded "${newDoc.name}" to case ${caseId}.`,
    });
    addToast('Document uploaded.');
  }, [appendAudit, addToast]);

  const deleteDocument = useCallback((caseId: string, docId: string) => {
    setCases(prev =>
      prev.map(c =>
        c.caseId === caseId
          ? { ...c, documents: c.documents.filter(d => d.docId !== docId), lastUpdatedAt: new Date().toISOString() }
          : c
      )
    );
    appendAudit({
      action: 'DOCUMENT_DELETED',
      entityType: 'DOCUMENT',
      entityId: docId,
      description: `Deleted document ${docId} from case ${caseId}.`,
    });
    addToast('Document deleted.', 'info');
  }, [appendAudit, addToast]);

  // ─── Notes ─────────────────────────────────────────────────────────────────

  const addNote = useCallback((caseId: string, note: Omit<LawyerNote, 'noteId' | 'createdAt' | 'updatedAt'>) => {
    const newNote: LawyerNote = {
      ...note,
      noteId: `NOTE-${Date.now()}`,
      caseId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCases(prev =>
      prev.map(c => c.caseId === caseId ? { ...c, notes: [...c.notes, newNote] } : c)
    );
    appendAudit({
      action: 'NOTE_ADDED',
      entityType: 'NOTE',
      entityId: newNote.noteId,
      description: `Added private note "${newNote.title}" to case ${caseId}.`,
    });
    addToast('Note saved.');
  }, [appendAudit, addToast]);

  const updateNote = useCallback((caseId: string, noteId: string, updates: Partial<Pick<LawyerNote, 'title' | 'content'>>) => {
    setCases(prev =>
      prev.map(c =>
        c.caseId === caseId
          ? {
              ...c,
              notes: c.notes.map(n =>
                n.noteId === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
              ),
            }
          : c
      )
    );
    appendAudit({
      action: 'NOTE_UPDATED',
      entityType: 'NOTE',
      entityId: noteId,
      description: `Updated private note ${noteId} in case ${caseId}.`,
    });
    addToast('Note updated.');
  }, [appendAudit, addToast]);

  const deleteNote = useCallback((caseId: string, noteId: string) => {
    setCases(prev =>
      prev.map(c =>
        c.caseId === caseId ? { ...c, notes: c.notes.filter(n => n.noteId !== noteId) } : c
      )
    );
    appendAudit({
      action: 'NOTE_DELETED',
      entityType: 'NOTE',
      entityId: noteId,
      description: `Deleted private note ${noteId} from case ${caseId}.`,
    });
    addToast('Note deleted.', 'info');
  }, [appendAudit, addToast]);

  // ─── Messages ──────────────────────────────────────────────────────────────

  const sendMessage = useCallback((caseId: string, text: string) => {
    const newMsg: CaseMessage = {
      messageId: `MSG-${Date.now()}`,
      caseId,
      senderId: profile.userId,
      senderRole: 'LAWYER',
      senderName: profile.fullName,
      text,
      sentAt: new Date().toISOString(),
    };
    setCases(prev =>
      prev.map(c => c.caseId === caseId ? { ...c, messages: [...c.messages, newMsg], lastUpdatedAt: new Date().toISOString() } : c)
    );
    appendAudit({
      action: 'MESSAGE_SENT',
      entityType: 'MESSAGE',
      entityId: newMsg.messageId,
      description: `Sent message in case ${caseId}.`,
    });
  }, [profile.userId, profile.fullName, appendAudit]);

  // ─── Appointments ──────────────────────────────────────────────────────────

  const updateAppointmentStatus = useCallback((appointmentId: string, status: AppointmentStatus, _note?: string) => {
    setAppointments(prev =>
      prev.map(a => a.appointmentId === appointmentId ? { ...a, status, updatedAt: new Date().toISOString() } : a)
    );
    const actionMap: Record<AppointmentStatus, typeof appendAudit extends (e: infer E) => void ? E['action'] : never> = {
      CONFIRMED: 'APPOINTMENT_ACCEPTED',
      CANCELLED: 'APPOINTMENT_REJECTED',
      RESCHEDULED: 'APPOINTMENT_RESCHEDULED',
      COMPLETED: 'APPOINTMENT_COMPLETED',
      PENDING: 'APPOINTMENT_ACCEPTED',
    };
    appendAudit({
      action: actionMap[status] ?? 'APPOINTMENT_ACCEPTED',
      entityType: 'APPOINTMENT',
      entityId: appointmentId,
      description: `Appointment ${appointmentId} status changed to ${status}.`,
    });
    addToast(`Appointment ${status.toLowerCase()}.`);
  }, [appendAudit, addToast]);

  // ─── Notifications ─────────────────────────────────────────────────────────

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast('All notifications marked as read.', 'info');
  }, [addToast]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ─── Availability ──────────────────────────────────────────────────────────

  const updateAvailability = useCallback((slots: AvailabilitySlot[]) => {
    setAvailability(slots);
    appendAudit({
      action: 'AVAILABILITY_UPDATED',
      entityType: 'AVAILABILITY',
      entityId: profile.lawyerId,
      description: 'Lawyer updated weekly availability.',
    });
    addToast('Availability saved.');
  }, [appendAudit, addToast, profile.lawyerId]);

  // ─── Context Value ─────────────────────────────────────────────────────────

  const value: LawyerContextValue = {
    profile,
    updateProfile,
    caseRequests,
    acceptCaseRequest,
    rejectCaseRequest,
    requestMoreInfo,
    cases,
    updateCaseStatus,
    uploadDocument,
    deleteDocument,
    addNote,
    updateNote,
    deleteNote,
    sendMessage,
    appointments,
    updateAppointmentStatus,
    payments,
    earnings,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadCount,
    availability,
    updateAvailability,
    auditLog,
    toasts,
    addToast,
    removeToast,
  };

  return <LawyerContext.Provider value={value}>{children}</LawyerContext.Provider>;
}
