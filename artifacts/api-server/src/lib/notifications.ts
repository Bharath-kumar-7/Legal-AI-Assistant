import { db, notificationsTable } from '@workspace/db';

interface CreateNotificationInput {
  userId: number;           // recipient
  senderUserId?: number;
  senderRole: 'CLIENT' | 'LAWYER' | 'ADMIN' | 'SYSTEM';
  title: string;
  message: string;
  source: 'CLIENT' | 'LAWYER' | 'ADMIN' | 'SYSTEM';
  relatedCaseId?: number;
  relatedCaseTitle?: string;
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  if (!db) return; // offline mode — skip
  await db.insert(notificationsTable).values({
    userId: input.userId,
    senderUserId: input.senderUserId ?? null,
    senderRole: input.senderRole,
    title: input.title,
    message: input.message,
    source: input.source,
    relatedCaseId: input.relatedCaseId ?? null,
    relatedCaseTitle: input.relatedCaseTitle ?? null,
    isRead: false,
  });
}

// Pipeline notifications — called automatically on key events
export const notify = {
  // Client → Lawyer: new case request
  newCaseRequest: (lawyerUserId: number, clientName: string, caseTitle: string, caseId: number) =>
    createNotification({
      userId: lawyerUserId,
      senderRole: 'CLIENT',
      source: 'CLIENT',
      title: 'New Case Request',
      message: `${clientName} has sent you a case request for: "${caseTitle}"`,
      relatedCaseId: caseId,
      relatedCaseTitle: caseTitle,
    }),

  // Lawyer → Client: case accepted
  caseAccepted: (clientUserId: number, lawyerName: string, caseTitle: string, caseId: number) =>
    createNotification({
      userId: clientUserId,
      senderRole: 'LAWYER',
      source: 'LAWYER',
      title: 'Case Accepted',
      message: `${lawyerName} has accepted your case: "${caseTitle}"`,
      relatedCaseId: caseId,
      relatedCaseTitle: caseTitle,
    }),

  // Lawyer → Client: case rejected
  caseRejected: (clientUserId: number, lawyerName: string, caseTitle: string, reason: string) =>
    createNotification({
      userId: clientUserId,
      senderRole: 'LAWYER',
      source: 'LAWYER',
      title: 'Case Request Declined',
      message: `${lawyerName} has declined your case request. Reason: ${reason}`,
      relatedCaseTitle: caseTitle,
    }),

  // Lawyer → Client: more info requested
  infoRequested: (clientUserId: number, lawyerName: string, caseTitle: string, question: string, caseId: number) =>
    createNotification({
      userId: clientUserId,
      senderRole: 'LAWYER',
      source: 'LAWYER',
      title: 'Information Requested',
      message: `${lawyerName} needs more information about "${caseTitle}": ${question}`,
      relatedCaseId: caseId,
      relatedCaseTitle: caseTitle,
    }),

  // Lawyer → Client: new message
  newMessage: (clientUserId: number, lawyerName: string, caseTitle: string, caseId: number) =>
    createNotification({
      userId: clientUserId,
      senderRole: 'LAWYER',
      source: 'LAWYER',
      title: 'New Message',
      message: `${lawyerName} sent you a message regarding "${caseTitle}"`,
      relatedCaseId: caseId,
      relatedCaseTitle: caseTitle,
    }),

  // Client → Lawyer: new message
  clientMessage: (lawyerUserId: number, clientName: string, caseTitle: string, caseId: number) =>
    createNotification({
      userId: lawyerUserId,
      senderRole: 'CLIENT',
      source: 'CLIENT',
      title: 'New Message',
      message: `${clientName} sent you a message regarding "${caseTitle}"`,
      relatedCaseId: caseId,
      relatedCaseTitle: caseTitle,
    }),

  // Lawyer → Client: case status updated
  caseStatusUpdated: (clientUserId: number, lawyerName: string, caseTitle: string, newStatus: string, caseId: number) =>
    createNotification({
      userId: clientUserId,
      senderRole: 'LAWYER',
      source: 'LAWYER',
      title: 'Case Status Updated',
      message: `${lawyerName} updated your case "${caseTitle}" to: ${newStatus.replace(/_/g, ' ')}`,
      relatedCaseId: caseId,
      relatedCaseTitle: caseTitle,
    }),

  // Admin → Lawyer: verification approved
  lawyerVerified: (lawyerUserId: number) =>
    createNotification({
      userId: lawyerUserId,
      senderRole: 'ADMIN',
      source: 'ADMIN',
      title: 'Account Verified ✓',
      message: 'Your bar credentials have been verified. Your Nyaya lawyer account is now fully active.',
    }),

  // Admin → Lawyer: verification rejected
  lawyerRejected: (lawyerUserId: number, reason: string) =>
    createNotification({
      userId: lawyerUserId,
      senderRole: 'ADMIN',
      source: 'ADMIN',
      title: 'Verification Declined',
      message: `Your verification was not approved. Reason: ${reason}. Please contact support.`,
    }),

  // Admin → Client/Lawyer: account suspended
  accountSuspended: (userId: number, reason: string) =>
    createNotification({
      userId,
      senderRole: 'ADMIN',
      source: 'ADMIN',
      title: 'Account Suspended',
      message: `Your account has been temporarily suspended. Reason: ${reason}. Contact support to appeal.`,
    }),

  // System → Client: appointment confirmed
  appointmentConfirmed: (clientUserId: number, lawyerName: string, date: string, time: string) =>
    createNotification({
      userId: clientUserId,
      senderRole: 'SYSTEM',
      source: 'SYSTEM',
      title: 'Appointment Confirmed',
      message: `Your appointment with ${lawyerName} on ${date} at ${time} has been confirmed.`,
    }),

  // System → Lawyer: new appointment booked
  appointmentBooked: (lawyerUserId: number, clientName: string, date: string, time: string) =>
    createNotification({
      userId: lawyerUserId,
      senderRole: 'SYSTEM',
      source: 'SYSTEM',
      title: 'New Appointment Booked',
      message: `${clientName} has booked an appointment with you on ${date} at ${time}.`,
    }),

  // Client → Lawyer: document uploaded
  documentUploaded: (lawyerUserId: number, clientName: string, docName: string, caseTitle: string, caseId: number) =>
    createNotification({
      userId: lawyerUserId,
      senderRole: 'CLIENT',
      source: 'CLIENT',
      title: 'Document Uploaded',
      message: `${clientName} uploaded "${docName}" for case: "${caseTitle}"`,
      relatedCaseId: caseId,
      relatedCaseTitle: caseTitle,
    }),
};
