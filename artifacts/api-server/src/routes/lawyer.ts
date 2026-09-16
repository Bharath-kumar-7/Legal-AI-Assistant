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
      res.json({
        lawyerId: "LAW-000101",
        userId: String(userId),
        fullName: req.auth!.email.split("@")[0] || "Advocate",
        email: req.auth!.email,
        phone: "+91 98200 44556",
        location: "Mumbai, Maharashtra",
        barCouncilNumber: "MAH/4821/2012",
        barCouncilState: "Bar Council of Maharashtra & Goa",
        yearsOfExperience: 12,
        practiceAreas: ["Civil Law", "Property Law", "Consumer Law"],
        courtLocations: ["Bombay High Court", "City Civil Court Mumbai"],
        languages: ["English", "Hindi", "Marathi"],
        bio: "Specialist in litigation and property matters.",
        verificationStatus: "VERIFIED",
        accountStatus: "ACTIVE",
        createdAt: new Date().toISOString(),
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
          verificationStatus: "VERIFIED",
          accountStatus: "ACTIVE",
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
    if (!db) {
      res.json([]);
      return;
    }
    const requests = await db
      .select()
      .from(caseRequestsTable)
      .where(eq(caseRequestsTable.lawyerId, userId))
      .orderBy(desc(caseRequestsTable.createdAt));

    const result = await Promise.all(
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
          oppositeParty: c?.oppositeParty || undefined,
          description: c?.description || "",
          submittedAt: r.createdAt.toISOString(),
          decidedAt: r.decidedAt ? r.decidedAt.toISOString() : undefined,
          conflictChecked: r.conflictChecked,
          rejectReason: r.rejectReason || undefined,
          infoRequest: r.infoRequest || undefined,
          client: {
            clientId: String(client?.id || r.clientId),
            name: client?.fullName || "Client",
            email: client?.email || "",
            phone: "+91 98765 43210",
            location: "India",
          },
          documents: docs.map((d) => ({
            docId: d.docRef,
            name: d.name,
            fileName: d.fileName,
            fileType: d.fileType,
            fileSize: d.fileSize,
            category: d.category,
            uploadedBy: d.uploadedByRole,
            uploadedByName: "Client",
            uploadedAt: d.createdAt.toISOString(),
          })),
        };
      }),
    );

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

    if (!db) {
      res.json({ success: true });
      return;
    }

    const [request] = await db
      .select()
      .from(caseRequestsTable)
      .where(and(eq(caseRequestsTable.requestRef, requestRef), eq(caseRequestsTable.lawyerId, userId)))
      .limit(1);

    if (!request) {
      res.status(404).json({ error: "Case request not found" });
      return;
    }

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
    if (!db) {
      res.json([]);
      return;
    }

    const cases = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.lawyerId, userId))
      .orderBy(desc(casesTable.updatedAt));

    const result = await Promise.all(
      cases.map(async (c) => {
        const [client] = await db!.select().from(usersTable).where(eq(usersTable.id, c.clientId)).limit(1);
        const docs = await db!.select().from(caseDocumentsTable).where(eq(caseDocumentsTable.caseId, c.id));
        const messages = await db!.select().from(caseMessagesTable).where(eq(caseMessagesTable.caseId, c.id));
        const notes = await db!.select().from(caseNotesTable).where(eq(caseNotesTable.caseId, c.id));

        return {
          caseId: c.caseRef,
          caseTitle: c.title,
          category: c.category,
          currentStatus: c.status,
          statusLabel: c.status.replace(/_/g, " "),
          progress: c.progress,
          nextStep: c.nextStep || "Matter under active review",
          client: {
            clientId: String(client?.id || c.clientId),
            name: client?.fullName || "Client",
            email: client?.email || "",
            phone: "+91 98765 43210",
            location: "India",
          },
          documents: docs.map((d) => ({
            docId: d.docRef,
            name: d.name,
            fileType: d.fileType,
            fileSize: d.fileSize,
            category: d.category,
            uploadedBy: d.uploadedByRole,
            uploadedAt: d.createdAt.toISOString(),
          })),
          messages: messages.map((m) => ({
            messageId: String(m.id),
            senderRole: m.senderRole,
            senderName: m.senderRole === "LAWYER" ? "You" : client?.fullName || "Client",
            text: m.text,
            sentAt: m.createdAt.toISOString(),
            readAt: m.readAt ? m.readAt.toISOString() : undefined,
          })),
          notes: notes.map((n) => ({
            noteId: String(n.id),
            title: n.title,
            content: n.content,
            isPrivate: n.isPrivate,
            createdAt: n.createdAt.toISOString(),
          })),
          updatedAt: c.updatedAt.toISOString(),
        };
      }),
    );

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

    if (!db) {
      res.json({ success: true });
      return;
    }

    const [c] = await db
      .select()
      .from(casesTable)
      .where(and(eq(casesTable.caseRef, caseRef), eq(casesTable.lawyerId, userId)))
      .limit(1);

    if (!c) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    const progressMap: Record<string, number> = {
      CREATED: 8,
      ACTIVE: 25,
      CONSULTATION_SCHEDULED: 35,
      DOCUMENTS_UPLOADED: 45,
      UNDER_REVIEW: 55,
      LEGAL_NOTICE: 65,
      COURT_FILING: 75,
      HEARING: 88,
      RESOLVED: 100,
      CLOSED: 100,
    };

    const progress = progressMap[status] ?? c.progress;

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

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error("Error in PATCH /lawyer/cases/:id/status:", error);
    res.status(500).json({ error: "Failed to update case status" });
  }
});

// ─── Messages ─────────────────────────────────────────────────────────────────
router.post("/lawyer/cases/:id/messages", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const caseRef = req.params.id;
    const { text } = req.body as { text: string };

    if (!text || !text.trim()) {
      res.status(400).json({ error: "Message text is required" });
      return;
    }

    if (!db) {
      res.json({ messageId: String(Date.now()), text, sentAt: new Date().toISOString() });
      return;
    }

    const [c] = await db.select().from(casesTable).where(eq(casesTable.caseRef, caseRef)).limit(1);
    if (!c) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    const [msg] = await db
      .insert(caseMessagesTable)
      .values({
        caseId: c.id,
        senderUserId: userId,
        senderRole: "LAWYER",
        text: text.trim(),
      })
      .returning();

    const [lawyer] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    await notify.newMessage(c.clientId, lawyer?.fullName || "Your lawyer", c.title, c.id);

    res.json({
      messageId: String(msg.id),
      senderRole: "LAWYER",
      senderName: lawyer?.fullName || "You",
      text: msg.text,
      sentAt: msg.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in POST /lawyer/cases/:id/messages:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ─── Appointments ─────────────────────────────────────────────────────────────
router.get("/lawyer/appointments", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      res.json([]);
      return;
    }

    const appts = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.lawyerId, userId))
      .orderBy(desc(appointmentsTable.createdAt));

    const result = await Promise.all(
      appts.map(async (a) => {
        const [client] = await db!.select().from(usersTable).where(eq(usersTable.id, a.clientId)).limit(1);
        let caseTitle = "Direct Consultation";
        if (a.caseId) {
          const [c] = await db!.select().from(casesTable).where(eq(casesTable.id, a.caseId)).limit(1);
          if (c) caseTitle = c.title;
        }

        return {
          appointmentId: a.apptRef,
          client: {
            clientId: String(client?.id || a.clientId),
            name: client?.fullName || "Client",
            email: client?.email || "",
            phone: "+91 98765 43210",
          },
          caseTitle,
          type: a.type,
          date: a.date,
          time: a.time,
          fee: a.fee,
          status: a.status,
          meetingLink: a.meetingLink || undefined,
        };
      }),
    );

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
    const { status, date, time } = req.body as { status: string; date?: string; time?: string };

    if (!db) {
      res.json({ success: true });
      return;
    }

    const [a] = await db
      .select()
      .from(appointmentsTable)
      .where(and(eq(appointmentsTable.apptRef, apptRef), eq(appointmentsTable.lawyerId, userId)))
      .limit(1);

    if (!a) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

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
