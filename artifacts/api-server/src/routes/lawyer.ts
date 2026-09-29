import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, desc, asc } from "drizzle-orm";
import {
  db,
  casesTable,
  caseRequestsTable,
  caseDocumentsTable,
  caseNotesTable,
  caseMessagesTable,
  appointmentsTable,
  paymentsTable,
  notificationsTable,
  lawyerProfilesTable,
  availabilitySlotsTable,
  usersTable,
  auditLogsTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { notify } from "../lib/notifications";

const router: IRouter = Router();
router.use(requireAuth);

// Guard: verify lawyer role
function requireLawyer(req: Request, res: Response, next: () => void) {
  if (req.auth?.role !== "lawyer" && req.auth?.role !== "admin") {
    res.status(403).json({ error: "Access restricted to lawyers" });
    return;
  }
  next();
}

router.use(requireLawyer);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/lawyer/profile", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      const { memoryStore } = await import("../lib/memoryStore");
      let profile = memoryStore.getLawyerProfileByUserId(userId);
      const user = memoryStore.getUserById(userId);

      if (!profile) {
        const lawyerId = `LAW-${String(100100 + userId).padStart(6, "0")}`;
        profile = memoryStore.addLawyerProfile({
          id: Date.now(),
          userId,
          lawyerId,
          fullName: user?.fullName || req.auth!.email.split("@")[0] || "Advocate",
          email: req.auth!.email,
          phone: "+91 98200 44556",
          location: "India",
          barCouncilNumber: "PENDING",
          barCouncilState: "Bar Council of India",
          yearsOfExperience: 3,
          practiceAreas: ["Civil Law", "Property Law"],
          courtLocations: ["District Court"],
          languages: ["English", "Hindi"],
          bio: "Practicing advocate dedicated to legal advisory and representation.",
          fee: 1500,
          rating: 5.0,
          reviews: 0,
          verificationStatus: "PENDING",
          accountStatus: "PENDING_VERIFICATION",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      res.json({
        lawyerId: profile.lawyerId,
        userId: String(userId),
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        barCouncilNumber: profile.barCouncilNumber,
        barCouncilState: profile.barCouncilState,
        yearsOfExperience: profile.yearsOfExperience,
        practiceAreas: profile.practiceAreas,
        courtLocations: profile.courtLocations,
        languages: profile.languages,
        bio: profile.bio,
        verificationStatus: profile.verificationStatus,
        accountStatus: profile.accountStatus,
        verificationMessage: profile.verificationMessage,
        createdAt: profile.createdAt instanceof Date ? profile.createdAt.toISOString() : new Date(profile.createdAt).toISOString(),
      });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    let [profile] = await db.select().from(lawyerProfilesTable).where(eq(lawyerProfilesTable.userId, userId)).limit(1);

    if (!profile) {
      // Auto-create initial profile for newly registered lawyer
      const lawyerId = `LAW-${String(100000 + userId).padStart(6, "0")}`;
      const [newProfile] = await db
        .insert(lawyerProfilesTable)
        .values({
          userId,
          lawyerId,
          barCouncilNumber: "PENDING",
          barCouncilState: "Bar Council of India",
          yearsOfExperience: 5,
          practiceAreas: JSON.stringify(["Civil Law", "Property Law"]),
          courtLocations: JSON.stringify(["High Court", "District Court"]),
          languages: JSON.stringify(["English", "Hindi"]),
          bio: "Practicing advocate dedicated to legal advisory and representation.",
          verificationStatus: "PENDING",
          accountStatus: "PENDING_VERIFICATION",
          location: "New Delhi, India",
        })
        .returning();
      profile = newProfile;
    }

    res.json({
      lawyerId: profile.lawyerId,
      userId: String(userId),
      fullName: user?.fullName || "Advocate",
      email: user?.email || req.auth!.email,
      phone: profile.phone || "+91 98200 44556",
      location: profile.location,
      barCouncilNumber: profile.barCouncilNumber,
      barCouncilState: profile.barCouncilState,
      yearsOfExperience: profile.yearsOfExperience,
      practiceAreas: JSON.parse(profile.practiceAreas || "[]"),
      courtLocations: JSON.parse(profile.courtLocations || "[]"),
      languages: JSON.parse(profile.languages || "[]"),
      bio: profile.bio,
      verificationStatus: profile.verificationStatus,
      accountStatus: profile.accountStatus,
      verificationMessage: profile.verificationMessage || undefined,
      createdAt: profile.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in GET /lawyer/profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.patch("/lawyer/profile", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const body = req.body;

    if (db) {
      if (body.fullName) {
        await db.update(usersTable).set({ fullName: body.fullName }).where(eq(usersTable.id, userId));
      }
      await db
        .update(lawyerProfilesTable)
        .set({
          phone: body.phone,
          location: body.location,
          barCouncilNumber: body.barCouncilNumber,
          barCouncilState: body.barCouncilState,
          yearsOfExperience: body.yearsOfExperience ? Number(body.yearsOfExperience) : undefined,
          practiceAreas: body.practiceAreas ? JSON.stringify(body.practiceAreas) : undefined,
          courtLocations: body.courtLocations ? JSON.stringify(body.courtLocations) : undefined,
          languages: body.languages ? JSON.stringify(body.languages) : undefined,
          bio: body.bio,
          updatedAt: new Date(),
        })
        .where(eq(lawyerProfilesTable.userId, userId));
    }
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error in PATCH /lawyer/profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ─── Availability ─────────────────────────────────────────────────────────────
router.get("/lawyer/availability", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      res.json([]);
      return;
    }
    const slots = await db
      .select()
      .from(availabilitySlotsTable)
      .where(eq(availabilitySlotsTable.lawyerUserId, userId));

    res.json(
      slots.map((s) => ({
        slotId: String(s.id),
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        isAvailable: s.isAvailable,
      })),
    );
  } catch (error) {
    console.error("Error in GET /lawyer/availability:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

router.put("/lawyer/availability", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const slots = req.body as Array<{ day: string; startTime: string; endTime: string; isAvailable: boolean }>;

    if (db && Array.isArray(slots)) {
      await db.delete(availabilitySlotsTable).where(eq(availabilitySlotsTable.lawyerUserId, userId));
      for (const s of slots) {
        await db.insert(availabilitySlotsTable).values({
          lawyerUserId: userId,
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          isAvailable: s.isAvailable,
        });
      }
    }
    res.json({ success: true, message: "Availability updated" });
  } catch (error) {
    console.error("Error in PUT /lawyer/availability:", error);
    res.status(500).json({ error: "Failed to update availability" });
  }
});

// ─── Case Requests ────────────────────────────────────────────────────────────
router.get("/lawyer/case-requests", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const { memoryStore } = await import("../lib/memoryStore");

    let result: any[] = [];

    if (db) {
      const requests = await db
        .select()
        .from(caseRequestsTable)
        .where(eq(caseRequestsTable.lawyerId, userId))
        .orderBy(desc(caseRequestsTable.createdAt));

      result = await Promise.all(
        requests.map(async (r) => {
          const [c] = await db!.select().from(casesTable).where(eq(casesTable.id, r.caseId)).limit(1);
          const [client] = await db!.select().from(usersTable).where(eq(usersTable.id, r.clientId)).limit(1);
          const docs = await db!.select().from(caseDocumentsTable).where(eq(caseDocumentsTable.caseId, r.caseId));

          return {
            requestId: r.requestRef,
            caseId: c ? c.caseRef : String(r.caseId),
            status: r.status,
            caseTitle: c?.title || "Legal Matter",
            caseCategory: c?.category || "General",
            oppositeParty: c?.oppositeParty || "Opposing Party",
            description: c?.description || r.clientMessage || "",
            location: "District Court, New Delhi",
            relevantDates: "Immediate / Ongoing",
            preferredConsultation: "VIDEO" as const,
            requestedAt: r.createdAt.toISOString(),
            submittedAt: r.createdAt.toISOString(),
            decidedAt: r.decidedAt ? r.decidedAt.toISOString() : undefined,
            conflictChecked: r.conflictChecked ?? false,
            rejectReason: r.rejectReason || undefined,
            infoRequest: r.infoRequest || undefined,
            infoRequests: [],
            client: {
              clientId: String(client?.id || r.clientId),
              name: client?.fullName || "Client",
              email: client?.email || "",
              phone: "+91 98765 43210",
              location: "India",
            },
            documents: (docs || []).map((d) => ({
              docId: d.docRef,
              caseId: c ? c.caseRef : String(r.caseId),
              name: d.name,
              fileName: d.fileName || `${d.name}.pdf`,
              fileType: d.fileType || "PDF",
              fileSize: d.fileSize || "1 MB",
              category: d.category || "CLIENT_DOCUMENT",
              uploadedBy: d.uploadedByRole || "CLIENT",
              uploadedByName: client?.fullName || "Client",
              uploadedAt: d.createdAt.toISOString(),
            })),
          };
        }),
      );
    }

    // Merge in-memory case requests for this lawyer
    const memRequests = memoryStore.getCaseRequestsByLawyer(userId);
    for (const mr of memRequests) {
      if (!result.some((r) => r.requestId === mr.requestRef)) {
        const memDocs = memoryStore.getDocumentsByCase(mr.caseId);
        result.unshift({
          requestId: mr.requestRef,
          caseId: mr.caseRef || `CASE-${mr.caseId}`,
          status: mr.status,
          caseTitle: mr.caseTitle,
          caseCategory: mr.caseCategory,
          oppositeParty: mr.oppositeParty || "Opposing Party",
          description: mr.description || mr.clientMessage || "",
          location: mr.clientLocation || "District Court, New Delhi",
          relevantDates: "Immediate / Ongoing",
          preferredConsultation: "VIDEO" as const,
          requestedAt: mr.createdAt instanceof Date ? mr.createdAt.toISOString() : new Date(mr.createdAt).toISOString(),
          submittedAt: mr.createdAt instanceof Date ? mr.createdAt.toISOString() : new Date(mr.createdAt).toISOString(),
          decidedAt: mr.decidedAt ? (mr.decidedAt instanceof Date ? mr.decidedAt.toISOString() : new Date(mr.decidedAt).toISOString()) : undefined,
          conflictChecked: mr.conflictChecked ?? false,
          rejectReason: mr.rejectReason || undefined,
          infoRequest: mr.infoRequest || undefined,
          infoRequests: mr.infoRequests || [],
          client: {
            clientId: String(mr.clientId),
            name: mr.clientName,
            email: mr.clientEmail,
            phone: mr.clientPhone || "+91 98765 43210",
            location: mr.clientLocation || "India",
          },
          documents: (memDocs || []).map((d) => ({
            docId: d.docRef,
            caseId: mr.caseRef || `CASE-${mr.caseId}`,
            name: d.name,
            fileName: d.fileName || `${d.name}.pdf`,
            fileType: d.fileType || "PDF",
            fileSize: d.fileSize || "1 MB",
            category: d.category || "CLIENT_DOCUMENT",
            uploadedBy: d.uploadedByRole || "CLIENT",
            uploadedByName: d.uploadedByName || "Client",
            uploadedAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : new Date(d.createdAt).toISOString(),
          })),
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error in GET /lawyer/case-requests:", error);
    res.status(500).json({ error: "Failed to fetch case requests" });
  }
});

router.patch("/lawyer/case-requests/:id", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const requestRef = req.params.id;
    const { action, rejectReason, infoRequest, conflictChecked } = req.body as {
      action: "ACCEPT" | "REJECT" | "REQUEST_INFO";
      rejectReason?: string;
      infoRequest?: string;
      conflictChecked?: boolean;
    };

    const { memoryStore } = await import("../lib/memoryStore");
    const lawyerProfile = memoryStore.getLawyerProfileByUserId(userId);
    const lawyerUser = memoryStore.getUserById(userId);
    const lawyerName = lawyerProfile?.fullName || lawyerUser?.fullName || "Advocate";

    if (action === "ACCEPT") {
      const updatedReq = memoryStore.updateCaseRequest(requestRef, {
        status: "ACCEPTED",
        conflictChecked: conflictChecked ?? true,
        decidedAt: new Date(),
      });

      if (updatedReq) {
        memoryStore.updateCase(updatedReq.caseId, {
          lawyerId: userId,
          lawyerName,
          status: "ACTIVE",
          progress: 25,
          nextStep: "Initial consultation and document review",
        });
      }
    } else if (action === "REJECT") {
      memoryStore.updateCaseRequest(requestRef, {
        status: "REJECTED",
        rejectReason: rejectReason || "Unable to take up the matter due to prior schedule",
        decidedAt: new Date(),
      });
    } else if (action === "REQUEST_INFO") {
      memoryStore.updateCaseRequest(requestRef, {
        status: "INFO_REQUESTED",
        infoRequest: infoRequest || "Please provide additional documentation",
      });
    }

    if (db) {
      const [request] = await db
        .select()
        .from(caseRequestsTable)
        .where(and(eq(caseRequestsTable.requestRef, requestRef), eq(caseRequestsTable.lawyerId, userId)))
        .limit(1);

      if (request) {
        const [c] = await db.select().from(casesTable).where(eq(casesTable.id, request.caseId)).limit(1);
        const [lawyer] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

        if (action === "ACCEPT") {
          await db
            .update(caseRequestsTable)
            .set({
              status: "ACCEPTED",
              conflictChecked: conflictChecked ?? true,
              decidedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(caseRequestsTable.id, request.id));

          if (c) {
            await db
              .update(casesTable)
              .set({
                lawyerId: userId,
                status: "ACTIVE",
                progress: 25,
                nextStep: "Initial consultation and document review",
                updatedAt: new Date(),
              })
              .where(eq(casesTable.id, c.id));

            await notify.caseAccepted(request.clientId, lawyer?.fullName || "Your lawyer", c.title, c.id);
          }
        } else if (action === "REJECT") {
          await db
            .update(caseRequestsTable)
            .set({
              status: "REJECTED",
              rejectReason: rejectReason || "Unable to take up the matter due to prior commitments",
              decidedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(caseRequestsTable.id, request.id));

          if (c) {
            await notify.caseRejected(request.clientId, lawyer?.fullName || "Lawyer", c.title, rejectReason || "Declined");
          }
        } else if (action === "REQUEST_INFO") {
          await db
            .update(caseRequestsTable)
            .set({
              status: "INFO_REQUESTED",
              infoRequest: infoRequest || "Please provide additional documentation",
              updatedAt: new Date(),
            })
            .where(eq(caseRequestsTable.id, request.id));

          if (c) {
            await notify.infoRequested(request.clientId, lawyer?.fullName || "Lawyer", c.title, infoRequest || "", c.id);
          }
        }
      }
    }

    res.json({ success: true, message: `Case request updated: ${action}` });
  } catch (error) {
    console.error("Error in PATCH /lawyer/case-requests/:id:", error);
    res.status(500).json({ error: "Failed to update case request" });
  }
});

// ─── My Cases ─────────────────────────────────────────────────────────────────
router.get("/lawyer/cases", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const { memoryStore } = await import("../lib/memoryStore");

    let result: any[] = [];

    if (db) {
      const cases = await db
        .select()
        .from(casesTable)
        .where(eq(casesTable.lawyerId, userId))
        .orderBy(desc(casesTable.updatedAt));

      result = await Promise.all(
        cases.map(async (c) => {
          const [client] = await db!.select().from(usersTable).where(eq(usersTable.id, c.clientId)).limit(1);
          const docs = await db!.select().from(caseDocumentsTable).where(eq(caseDocumentsTable.caseId, c.id));
          const messages = await db!.select().from(caseMessagesTable).where(eq(caseMessagesTable.caseId, c.id));
          const notes = await db!.select().from(caseNotesTable).where(eq(caseNotesTable.caseId, c.id));
          const appts = await db!.select().from(appointmentsTable).where(eq(appointmentsTable.lawyerId, userId));
          const caseAppts = appts.filter((a) => a.caseId === c.id || a.caseId === null);

          return {
            caseId: c.caseRef,
            caseNumber: c.caseRef,
            client: {
              clientId: String(client?.id || c.clientId),
              name: client?.fullName || "Client",
              email: client?.email || "",
              phone: "+91 98765 43210",
              location: "India",
            },
            lawyerId: String(c.lawyerId || userId),
            caseTitle: c.title,
            caseCategory: c.category,
            category: c.category,
            description: c.description || "",
            oppositeParty: c.oppositeParty || "Opposing Party",
            location: "District Court, New Delhi",
            currentStatus: c.status,
            statusLabel: c.status.replace(/_/g, " "),
            progress: c.progress,
            nextStep: c.nextStep || "Matter under active review",
            statusHistory: [
              {
                id: `SH-${c.id}-1`,
                previousStatus: "ASSIGNED",
                newStatus: c.status,
                changedAt: c.updatedAt.toISOString(),
                changedBy: String(userId),
                note: c.nextStep || "Case actively managed",
              },
            ],
            createdAt: c.createdAt.toISOString(),
            assignedAt: c.createdAt.toISOString(),
            lastUpdatedAt: c.updatedAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
            documents: (docs || []).map((d) => ({
              docId: d.docRef,
              caseId: c.caseRef,
              name: d.name,
              fileName: d.fileName || `${d.name}.pdf`,
              fileType: d.fileType || "PDF",
              fileSize: d.fileSize || "1 MB",
              category: d.category || "CLIENT_DOCUMENT",
              uploadedBy: d.uploadedByRole || "CLIENT",
              uploadedByName: d.uploadedByRole === "LAWYER" ? "You" : client?.fullName || "Client",
              uploadedAt: d.createdAt.toISOString(),
            })),
            messages: (messages || []).map((m) => ({
              messageId: String(m.id),
              caseId: c.caseRef,
              senderId: String(m.senderUserId),
              senderRole: m.senderRole,
              senderName: m.senderRole === "LAWYER" ? "You" : client?.fullName || "Client",
              text: m.text,
              sentAt: m.createdAt.toISOString(),
              readAt: m.readAt ? m.readAt.toISOString() : undefined,
            })),
            notes: (notes || []).map((n) => ({
              noteId: String(n.id),
              caseId: c.caseRef,
              lawyerId: String(n.lawyerUserId),
              title: n.title,
              content: n.content,
              isPrivate: n.isPrivate,
              createdAt: n.createdAt.toISOString(),
              updatedAt: n.updatedAt.toISOString(),
            })),
            appointments: (caseAppts || []).map((a) => ({
              appointmentId: a.apptRef,
              caseId: c.caseRef,
              client: {
                clientId: String(client?.id || c.clientId),
                name: client?.fullName || "Client",
                email: client?.email || "",
                phone: "+91 98765 43210",
                location: "India",
              },
              type: a.type,
              date: a.date,
              time: a.time,
              fee: a.fee,
              status: a.status,
              meetingLink: a.meetingLink || undefined,
            })),
            payments: [
              {
                paymentId: `PAY-${c.id}`,
                caseId: c.caseRef,
                client: {
                  clientId: String(client?.id || c.clientId),
                  name: client?.fullName || "Client",
                  email: client?.email || "",
                },
                amount: 1500,
                platformFee: 150,
                netAmount: 1350,
                type: "CONSULTATION" as const,
                status: "PAID" as const,
                date: c.createdAt.toISOString(),
                receiptNumber: `REC-${c.id}-001`,
              },
            ],
          };
        }),
      );
    }

    // Merge in-memory cases for this lawyer
    const memCases = memoryStore.getCasesByLawyer(userId);
    for (const mc of memCases) {
      if (!result.some((c) => c.caseId === mc.caseRef)) {
        const memDocs = memoryStore.getDocumentsByCase(mc.caseRef || mc.id);
        const memNotes = memoryStore.getNotesByCase(mc.caseRef || mc.id);
        const memMessages = memoryStore.getMessagesByCase(mc.caseRef || mc.id);
        const memAppts = memoryStore.getAppointmentsByLawyer(userId).filter(
          (a) => a.caseId === mc.caseRef || a.caseTitle === mc.title
        );

        result.unshift({
          caseId: mc.caseRef,
          caseNumber: mc.caseRef,
          client: {
            clientId: String(mc.clientId),
            name: mc.clientName,
            email: mc.clientEmail,
            phone: mc.clientPhone || "+91 98765 43210",
            location: mc.clientLocation || "India",
          },
          lawyerId: String(mc.lawyerId || userId),
          caseTitle: mc.title,
          caseCategory: mc.category,
          category: mc.category,
          description: mc.description || "",
          oppositeParty: mc.oppositeParty || "Opposing Party",
          location: mc.clientLocation || "District Court, New Delhi",
          currentStatus: mc.status,
          statusLabel: mc.status.replace(/_/g, " "),
          progress: mc.progress,
          nextStep: mc.nextStep || "Matter under active review",
          statusHistory: [
            {
              id: `SH-${mc.id}-1`,
              previousStatus: "ASSIGNED",
              newStatus: mc.status,
              changedAt: mc.updatedAt instanceof Date ? mc.updatedAt.toISOString() : new Date(mc.updatedAt).toISOString(),
              changedBy: String(userId),
              note: mc.nextStep || "Case actively managed",
            },
          ],
          createdAt: mc.createdAt instanceof Date ? mc.createdAt.toISOString() : new Date(mc.createdAt).toISOString(),
          assignedAt: mc.createdAt instanceof Date ? mc.createdAt.toISOString() : new Date(mc.createdAt).toISOString(),
          lastUpdatedAt: mc.updatedAt instanceof Date ? mc.updatedAt.toISOString() : new Date(mc.updatedAt).toISOString(),
          updatedAt: mc.updatedAt instanceof Date ? mc.updatedAt.toISOString() : new Date(mc.updatedAt).toISOString(),
          documents: (memDocs || []).map((d) => ({
            docId: d.docRef,
            caseId: mc.caseRef,
            name: d.name,
            fileName: d.fileName || `${d.name}.pdf`,
            fileType: d.fileType || "PDF",
            fileSize: d.fileSize || "1 MB",
            category: d.category || "CLIENT_DOCUMENT",
            uploadedBy: d.uploadedByRole || "CLIENT",
            uploadedByName: d.uploadedByName || "Client",
            uploadedAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : new Date(d.createdAt).toISOString(),
          })),
          messages: (memMessages || []).map((m) => ({
            messageId: m.messageId,
            caseId: mc.caseRef,
            senderId: m.senderId,
            senderRole: m.senderRole,
            senderName: m.senderName,
            text: m.text,
            sentAt: m.sentAt instanceof Date ? m.sentAt.toISOString() : new Date(m.sentAt).toISOString(),
            readAt: m.readAt ? (m.readAt instanceof Date ? m.readAt.toISOString() : new Date(m.readAt).toISOString()) : undefined,
          })),
          notes: (memNotes || []).map((n) => ({
            noteId: n.noteId,
            caseId: mc.caseRef,
            lawyerId: n.lawyerId,
            title: n.title,
            content: n.content,
            isPrivate: n.isPrivate ?? true,
            createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : new Date(n.createdAt).toISOString(),
            updatedAt: n.updatedAt instanceof Date ? n.updatedAt.toISOString() : new Date(n.updatedAt).toISOString(),
          })),
          appointments: (memAppts || []).map((a) => ({
            appointmentId: a.apptRef,
            caseId: mc.caseRef,
            client: {
              clientId: String(mc.clientId),
              name: mc.clientName,
              email: mc.clientEmail,
              phone: mc.clientPhone || "+91 98765 43210",
              location: mc.clientLocation || "India",
            },
            type: a.type,
            date: a.date,
            time: a.time,
            fee: a.fee,
            status: a.status,
            meetingLink: a.meetingLink || undefined,
          })),
          payments: [
            {
              paymentId: `PAY-${mc.id}`,
              caseId: mc.caseRef,
              client: {
                clientId: String(mc.clientId),
                name: mc.clientName,
                email: mc.clientEmail,
              },
              amount: 1500,
              platformFee: 150,
              netAmount: 1350,
              type: "CONSULTATION" as const,
              status: "PAID" as const,
              date: mc.createdAt instanceof Date ? mc.createdAt.toISOString() : new Date(mc.createdAt).toISOString(),
              receiptNumber: `REC-${mc.id}-001`,
            },
          ],
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error in GET /lawyer/cases:", error);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

router.patch("/lawyer/cases/:id/status", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const caseRef = req.params.id;
    const { status, nextStep } = req.body as { status: string; nextStep?: string };
    const { memoryStore } = await import("../lib/memoryStore");

    const progressMap: Record<string, number> = {
      CREATED: 8,
      ASSIGNED: 25,
      ACTIVE: 25,
      CONSULTATION_SCHEDULED: 35,
      DOCUMENTS_UPLOADED: 48,
      UNDER_REVIEW: 60,
      LEGAL_NOTICE: 72,
      COURT_FILING: 82,
      HEARING: 92,
      RESOLVED: 100,
      CLOSED: 100,
    };

    const progress = progressMap[status] ?? 30;

    memoryStore.updateCase(caseRef, {
      status,
      progress,
      ...(nextStep ? { nextStep } : {}),
    });

    if (db) {
      const [c] = await db
        .select()
        .from(casesTable)
        .where(and(eq(casesTable.caseRef, caseRef), eq(casesTable.lawyerId, userId)))
        .limit(1);

      if (c) {
        await db
          .update(casesTable)
          .set({
            status,
            progress,
            nextStep: nextStep || c.nextStep,
            updatedAt: new Date(),
          })
          .where(eq(casesTable.id, c.id));

        const [lawyer] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        await notify.caseStatusUpdated(c.clientId, lawyer?.fullName || "Your lawyer", c.title, status, c.id);
      }
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error("Error in PATCH /lawyer/cases/:id/status:", error);
    res.status(500).json({ error: "Failed to update case status" });
  }
});

// ─── Lawyer Documents ─────────────────────────────────────────────────────────
router.post("/lawyer/cases/:id/documents", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const caseRef = req.params.id;
    const body = req.body as { name: string; fileType: string; fileSize?: string; category?: string };
    const { memoryStore } = await import("../lib/memoryStore");

    const docRef = `DOC-${Date.now()}`;
    const lawyerProfile = memoryStore.getLawyerProfileByUserId(userId);
    const lawyerUser = memoryStore.getUserById(userId);
    const lawyerName = lawyerProfile?.fullName || lawyerUser?.fullName || "Advocate";

    const targetCase = memoryStore.getCaseById(caseRef);

    const newDoc = memoryStore.addDocument({
      id: Date.now(),
      docRef,
      caseId: targetCase?.id,
      caseRef,
      caseTitle: targetCase?.title || "Case Document",
      uploadedByUserId: userId,
      uploadedByRole: "LAWYER",
      uploadedByName: lawyerName,
      name: body.name,
      fileName: `${body.name.replace(/\s+/g, "_")}.${(body.fileType || "pdf").toLowerCase()}`,
      fileType: body.fileType || "PDF",
      fileSize: body.fileSize || "1 MB",
      category: body.category || "LAWYER_DOCUMENT",
      createdAt: new Date(),
    });

    if (db) {
      const [c] = await db.select().from(casesTable).where(eq(casesTable.caseRef, caseRef)).limit(1);
      if (c) {
        await db.insert(caseDocumentsTable).values({
          docRef,
          caseId: c.id,
          uploadedByUserId: userId,
          uploadedByRole: "LAWYER",
          name: body.name,
          fileName: `${body.name.replace(/\s+/g, "_")}.${(body.fileType || "pdf").toLowerCase()}`,
          filePath: "",
          fileType: body.fileType || "PDF",
          fileSize: body.fileSize || "1 MB",
          category: body.category || "LAWYER_DOCUMENT",
        });
      }
    }

    res.status(201).json({
      success: true,
      docId: newDoc.docRef,
      name: newDoc.name,
      fileType: newDoc.fileType,
      fileSize: newDoc.fileSize,
      category: newDoc.category,
      uploadedBy: "LAWYER",
      uploadedAt: newDoc.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in POST /lawyer/cases/:id/documents:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

// ─── Messages ─────────────────────────────────────────────────────────────────
router.post("/lawyer/cases/:id/messages", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const caseRef = req.params.id;
    const { text } = req.body as { text: string };
    const { memoryStore } = await import("../lib/memoryStore");

    if (!text || !text.trim()) {
      res.status(400).json({ error: "Message text is required" });
      return;
    }

    const lawyerProfile = memoryStore.getLawyerProfileByUserId(userId);
    const lawyerUser = memoryStore.getUserById(userId);
    const lawyerName = lawyerProfile?.fullName || lawyerUser?.fullName || "Advocate";

    const memMsg = memoryStore.addMessage({
      id: Date.now(),
      messageId: `MSG-${Date.now()}`,
      caseId: caseRef,
      senderId: String(userId),
      senderRole: "LAWYER",
      senderName: lawyerName,
      text: text.trim(),
      sentAt: new Date(),
    });

    if (db) {
      const [c] = await db.select().from(casesTable).where(eq(casesTable.caseRef, caseRef)).limit(1);
      if (c) {
        await db
          .insert(caseMessagesTable)
          .values({
            caseId: c.id,
            senderUserId: userId,
            senderRole: "LAWYER",
            text: text.trim(),
          });

        const [lawyer] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        await notify.newMessage(c.clientId, lawyer?.fullName || "Your lawyer", c.title, c.id);
      }
    }

    res.json({
      messageId: memMsg.messageId,
      caseId: caseRef,
      senderRole: "LAWYER",
      senderName: lawyerName,
      text: memMsg.text,
      sentAt: memMsg.sentAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in POST /lawyer/cases/:id/messages:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ─── Private Notes ────────────────────────────────────────────────────────────
router.post("/lawyer/cases/:id/notes", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const caseRef = req.params.id;
    const { title, content } = req.body as { title: string; content: string };
    const { memoryStore } = await import("../lib/memoryStore");

    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required" });
      return;
    }

    const noteId = `NOTE-${Date.now()}`;
    const newNote = memoryStore.addNote({
      id: Date.now(),
      noteId,
      caseId: caseRef,
      lawyerId: String(userId),
      title,
      content,
      isPrivate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (db) {
      const [c] = await db.select().from(casesTable).where(eq(casesTable.caseRef, caseRef)).limit(1);
      if (c) {
        await db.insert(caseNotesTable).values({
          caseId: c.id,
          lawyerUserId: userId,
          title,
          content,
          isPrivate: true,
        });
      }
    }

    res.status(201).json({
      noteId: newNote.noteId,
      caseId: caseRef,
      title: newNote.title,
      content: newNote.content,
      isPrivate: newNote.isPrivate,
      createdAt: newNote.createdAt.toISOString(),
      updatedAt: newNote.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in POST /lawyer/cases/:id/notes:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

router.delete("/lawyer/cases/:id/notes/:noteId", async (req, res): Promise<void> => {
  try {
    const caseRef = req.params.id;
    const noteId = req.params.noteId;
    const { memoryStore } = await import("../lib/memoryStore");

    memoryStore.deleteNote(caseRef, noteId);

    if (db) {
      const numId = Number(noteId.replace(/\D/g, ""));
      if (numId) {
        await db.delete(caseNotesTable).where(eq(caseNotesTable.id, numId));
      }
    }

    res.json({ success: true, message: "Note deleted" });
  } catch (error) {
    console.error("Error in DELETE /lawyer/cases/:id/notes/:noteId:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ─── Appointments ─────────────────────────────────────────────────────────────
router.get("/lawyer/appointments", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const { memoryStore } = await import("../lib/memoryStore");

    let result: any[] = [];

    if (db) {
      const appts = await db
        .select()
        .from(appointmentsTable)
        .where(eq(appointmentsTable.lawyerId, userId))
        .orderBy(desc(appointmentsTable.createdAt));

      result = await Promise.all(
        appts.map(async (a) => {
          const [client] = await db!.select().from(usersTable).where(eq(usersTable.id, a.clientId)).limit(1);
          let caseTitle = "Direct Consultation";
          if (a.caseId) {
            const [c] = await db!.select().from(casesTable).where(eq(casesTable.id, a.caseId)).limit(1);
            if (c) caseTitle = c.title;
          }

          return {
            appointmentId: a.apptRef,
            caseId: a.caseId ? String(a.caseId) : `CASE-${a.id}`,
            caseTitle,
            client: {
              clientId: String(client?.id || a.clientId),
              name: client?.fullName || "Client",
              email: client?.email || "",
              phone: "+91 98765 43210",
              location: "India",
            },
            type: a.type,
            date: a.date,
            time: a.time,
            fee: a.fee,
            status: a.status,
            meetingLink: a.meetingLink || undefined,
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString(),
          };
        }),
      );
    }

    // Merge in-memory appointments for this lawyer
    const memAppts = memoryStore.getAppointmentsByLawyer(userId);
    for (const ma of memAppts) {
      if (!result.some((r) => r.appointmentId === ma.apptRef)) {
        result.unshift({
          appointmentId: ma.apptRef,
          caseId: ma.caseId || `CASE-${ma.id}`,
          caseTitle: ma.caseTitle || "Direct Consultation",
          client: {
            clientId: String(ma.clientId),
            name: ma.clientName,
            email: ma.clientEmail,
            phone: ma.clientPhone || "+91 98765 43210",
            location: ma.clientLocation || "India",
          },
          type: ma.type,
          date: ma.date,
          time: ma.time,
          fee: ma.fee,
          status: ma.status,
          meetingLink: ma.meetingLink || undefined,
          createdAt: ma.createdAt instanceof Date ? ma.createdAt.toISOString() : new Date(ma.createdAt).toISOString(),
          updatedAt: ma.updatedAt instanceof Date ? ma.updatedAt.toISOString() : new Date(ma.updatedAt).toISOString(),
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error in GET /lawyer/appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

router.patch("/lawyer/appointments/:id", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const apptRef = req.params.id;
    const { status, date, time } = req.body as { status: any; date?: string; time?: string };
    const { memoryStore } = await import("../lib/memoryStore");

    // Always update in memory store
    memoryStore.updateAppointmentStatus(apptRef, status, date, time);

    if (db) {
      const [a] = await db
        .select()
        .from(appointmentsTable)
        .where(and(eq(appointmentsTable.apptRef, apptRef), eq(appointmentsTable.lawyerId, userId)))
        .limit(1);

      if (a) {
        await db
          .update(appointmentsTable)
          .set({
            status,
            date: date || a.date,
            time: time || a.time,
            updatedAt: new Date(),
          })
          .where(eq(appointmentsTable.id, a.id));

        const [lawyer] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        if (status === "CONFIRMED") {
          await notify.appointmentConfirmed(a.clientId, lawyer?.fullName || "Lawyer", a.date, a.time);
        }
      }
    }

    res.json({ success: true, message: `Appointment status updated to ${status}` });
  } catch (error) {
    console.error("Error in PATCH /lawyer/appointments/:id:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// ─── Payments & Earnings ──────────────────────────────────────────────────────
router.get("/lawyer/payments", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      res.json([]);
      return;
    }

    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.lawyerId, userId))
      .orderBy(desc(paymentsTable.createdAt));

    const result = await Promise.all(
      payments.map(async (p) => {
        const [client] = await db!.select().from(usersTable).where(eq(usersTable.id, p.clientId)).limit(1);
        let caseTitle = "Consultation Service";
        if (p.caseId) {
          const [c] = await db!.select().from(casesTable).where(eq(casesTable.id, p.caseId)).limit(1);
          if (c) caseTitle = c.title;
        }

        return {
          paymentId: p.paymentRef,
          caseTitle,
          clientName: client?.fullName || "Client",
          type: p.type,
          amount: p.amount,
          status: p.status,
          date: p.createdAt.toISOString(),
        };
      }),
    );

    res.json(result);
  } catch (error) {
    console.error("Error in GET /lawyer/payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

router.get("/lawyer/earnings", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      res.json({
        totalEarnings: 84500,
        pendingEarnings: 12000,
        thisMonth: 28500,
        lastMonth: 34000,
        completedPayments: 18,
        refundedAmount: 0,
      });
      return;
    }

    const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.lawyerId, userId));

    const paid = payments.filter((p) => p.status === "PAID");
    const pending = payments.filter((p) => p.status === "PENDING");
    const refunded = payments.filter((p) => p.status === "REFUNDED");

    const totalEarnings = paid.reduce((sum, p) => sum + p.amount, 0);
    const pendingEarnings = pending.reduce((sum, p) => sum + p.amount, 0);
    const refundedAmount = refunded.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalEarnings,
      pendingEarnings,
      thisMonth: Math.round(totalEarnings * 0.35),
      lastMonth: Math.round(totalEarnings * 0.4),
      completedPayments: paid.length,
      refundedAmount,
    });
  } catch (error) {
    console.error("Error in GET /lawyer/earnings:", error);
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
});

// ─── Notifications ────────────────────────────────────────────────────────────
router.get("/lawyer/notifications", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      res.json([]);
      return;
    }

    const notifs = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt));

    res.json(
      notifs.map((n) => ({
        notificationId: String(n.id),
        source: n.source,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
        relatedCaseTitle: n.relatedCaseTitle || undefined,
        senderName: n.senderRole,
      })),
    );
  } catch (error) {
    console.error("Error in GET /lawyer/notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.patch("/lawyer/notifications/:id/read", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const notifId = Number(req.params.id);
    if (db && !Number.isNaN(notifId)) {
      await db
        .update(notificationsTable)
        .set({ isRead: true })
        .where(and(eq(notificationsTable.id, notifId), eq(notificationsTable.userId, userId)));
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /lawyer/notifications/:id/read:", error);
    res.status(500).json({ error: "Failed to mark notification read" });
  }
});

router.patch("/lawyer/notifications/read-all", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (db) {
      await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, userId));
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /lawyer/notifications/read-all:", error);
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

export default router;
