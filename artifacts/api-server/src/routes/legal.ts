import { Router, type IRouter } from "express";
import {
  AskAssistantBody,
  AskAssistantResponse,
  CreateAppointmentBody,
  CreateAppointmentResponse,
  CreateCaseBody,
  CreateCaseResponse,
  CreateDocumentBody,
  CreateDocumentResponse,
  GetDashboardResponse,
  ListAppointmentsResponse,
  ListCasesResponse,
  ListDocumentsResponse,
  ListJudgmentsQueryParams,
  ListJudgmentsResponse,
  ListLawsQueryParams,
  ListLawsResponse,
  ListLawyersQueryParams,
  ListLawyersResponse,
  ListNewsResponse,
  ListPaymentsResponse,
  UpdateCaseBody,
  UpdateCaseParams,
  UpdateCaseResponse,
} from "@workspace/api-zod";
import { eq, and, desc } from "drizzle-orm";
import {
  db,
  casesTable,
  caseRequestsTable,
  caseDocumentsTable,
  appointmentsTable,
  paymentsTable,
  notificationsTable,
  lawyerProfilesTable,
  usersTable,
  auditLogsTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { notify } from "../lib/notifications";

const router: IRouter = Router();
router.use(requireAuth);

// ─── Reference Knowledge Base (Statutory Laws & Precedents) ───────────────────
const laws = [
  {
    id: 1,
    title: "The Consumer Protection Act, 2019",
    category: "Consumer",
    summary: "Protects consumer interests and provides a mechanism for timely settlement of consumer disputes.",
    sections: "Sections 2, 34, 35",
    updatedAt: "Updated 12 Jun 2026",
  },
  {
    id: 2,
    title: "The Digital Personal Data Protection Act, 2023",
    category: "Cyber",
    summary: "Establishes rights and duties for processing digital personal data while protecting individual privacy.",
    sections: "Sections 4, 8, 13",
    updatedAt: "Updated 28 May 2026",
  },
  {
    id: 3,
    title: "The Hindu Marriage Act, 1955",
    category: "Family",
    summary: "Governs marriage, divorce, restitution, maintenance, and related family law matters for Hindus.",
    sections: "Sections 9, 13, 24",
    updatedAt: "Updated 03 May 2026",
  },
  {
    id: 4,
    title: "The Transfer of Property Act, 1882",
    category: "Property",
    summary: "Defines and regulates the transfer of property between living persons in India.",
    sections: "Sections 5, 53A, 54",
    updatedAt: "Updated 19 Apr 2026",
  },
  {
    id: 5,
    title: "The Information Technology Act, 2000",
    category: "Cyber",
    summary: "Provides the legal framework for electronic records, digital signatures, and cyber offences.",
    sections: "Sections 43, 66, 72",
    updatedAt: "Updated 08 Apr 2026",
  },
];

const judgments = [
  {
    id: 1,
    title: "Vishaka v. State of Rajasthan",
    court: "Supreme Court of India",
    year: 1997,
    citation: "(1997) 6 SCC 241",
    summary: "Landmark judgment that laid down guidelines to address sexual harassment at the workplace.",
    category: "Labour",
  },
  {
    id: 2,
    title: "Justice K.S. Puttaswamy v. Union of India",
    court: "Supreme Court of India",
    year: 2017,
    citation: "(2017) 10 SCC 1",
    summary: "Recognised the right to privacy as a fundamental right protected by the Constitution.",
    category: "Constitutional",
  },
  {
    id: 3,
    title: "Indian Medical Association v. V.P. Shantha",
    court: "Supreme Court of India",
    year: 1995,
    citation: "(1995) 6 SCC 651",
    summary: "Clarified when medical services fall within the scope of consumer protection law.",
    category: "Consumer",
  },
];

const news = [
  {
    id: 1,
    title: "New consumer rules make online refund timelines clearer",
    category: "Consumer law",
    date: "14 Aug 2026",
    readTime: "4 min read",
    summary: "What the latest guidance means for delayed refunds, cancellations, and platform responsibility.",
  },
  {
    id: 2,
    title: "Understanding your rights after a data breach",
    category: "Cyber law",
    date: "10 Aug 2026",
    readTime: "6 min read",
    summary: "Practical steps to document an incident and understand the protections available to you.",
  },
  {
    id: 3,
    title: "Three documents to keep ready for a property consultation",
    category: "Property law",
    date: "06 Aug 2026",
    readTime: "3 min read",
    summary: "A simple preparation checklist to help your lawyer understand a property issue faster.",
  },
];

const matches = (value: string, query?: string) =>
  !query || value.toLowerCase().includes(query.toLowerCase());

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/dashboard", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      res.json(
        GetDashboardResponse.parse({
          userName: "Bharath",
          openCases: 3,
          upcomingAppointments: 2,
          documents: 3,
          unreadNotifications: 2,
          recentActivity: [
            { id: 1, title: "Case update", detail: "Property boundary dispute moved to lawyer review", timestamp: "2 hours ago", type: "case" },
            { id: 2, title: "Document added", detail: "Property deed — survey 104 is ready for review", timestamp: "Yesterday", type: "document" },
            { id: 3, title: "Appointment confirmed", detail: "Video consultation with Adv. Rohan Iyer", timestamp: "Yesterday", type: "appointment" },
          ],
        }),
      );
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const cases = await db.select().from(casesTable).where(eq(casesTable.clientId, userId));
    const openCases = cases.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED");

    const appts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.clientId, userId));
    const upcoming = appts.filter((a) => a.status === "PENDING" || a.status === "CONFIRMED");

    const docs = await db.select().from(caseDocumentsTable).where(eq(caseDocumentsTable.uploadedByUserId, userId));
    const notifs = await db
      .select()
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));

    const data = {
      userName: user?.fullName || "Client",
      openCases: openCases.length,
      upcomingAppointments: upcoming.length,
      documents: docs.length,
      unreadNotifications: notifs.length,
      recentActivity: [
        { id: 1, title: "Welcome", detail: "Nyaya legal platform active", timestamp: "Just now", type: "case" },
      ],
    };

    res.json(GetDashboardResponse.parse(data));
  } catch (error) {
    console.error("Error in GET /dashboard:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

// ─── Legal Library & News ─────────────────────────────────────────────────────
router.get("/laws", (req, res) => {
  const parsed = ListLawsQueryParams.safeParse(req.query);
  const query = parsed.success ? parsed.data : {};
  const result = laws.filter((law) => matches(`${law.title} ${law.summary} ${law.category}`, query.search) && matches(law.category, query.category));
  res.json(ListLawsResponse.parse(result));
});

router.get("/judgments", (req, res) => {
  const parsed = ListJudgmentsQueryParams.safeParse(req.query);
  const query = parsed.success ? parsed.data : {};
  const result = judgments.filter((item) => matches(`${item.title} ${item.summary} ${item.category}`, query.search) && matches(item.court, query.court) && (!query.year || item.year === query.year));
  res.json(ListJudgmentsResponse.parse(result));
});

router.get("/news", (_req, res) => {
  res.json(ListNewsResponse.parse(news));
});

// ─── Find a Lawyer (Real Database + Profiles) ─────────────────────────────────
router.get("/lawyers", async (req, res): Promise<void> => {
  try {
    const parsed = ListLawyersQueryParams.safeParse(req.query);
    const query = parsed.success ? parsed.data : {};

    if (!db) {
      const fallbackLawyers = [
        {
          id: 1,
          name: "Adv. Rohan Iyer",
          initials: "RI",
          specialization: "Property & Civil Law",
          experience: 12,
          location: "Mumbai, Maharashtra",
          rating: 4.9,
          reviews: 124,
          fee: 1800,
          verified: true,
          availability: "Available today",
        },
      ];
      res.json(ListLawyersResponse.parse(fallbackLawyers));
      return;
    }

    const lawyerUsers = await db.select().from(usersTable).where(eq(usersTable.role, "lawyer"));
    const profiles = await db.select().from(lawyerProfilesTable);

    const result = lawyerUsers.map((u) => {
      const prof = profiles.find((p) => p.userId === u.id);
      const practice = prof ? JSON.parse(prof.practiceAreas || "[]") : ["Civil Law"];
      const spec = practice[0] || "General Practice";

      return {
        id: u.id,
        name: u.fullName.startsWith("Adv.") ? u.fullName : `Adv. ${u.fullName}`,
        initials: u.fullName
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        specialization: spec,
        experience: prof?.yearsOfExperience || 8,
        location: prof?.location || "Mumbai, India",
        rating: 4.8,
        reviews: 42,
        fee: 1500,
        verified: prof ? prof.verificationStatus === "VERIFIED" : true,
        availability: "Available today",
      };
    });

    const filtered = result.filter(
      (l) =>
        matches(`${l.name} ${l.specialization} ${l.location}`, query.search) &&
        matches(l.specialization, query.category),
    );

    res.json(ListLawyersResponse.parse(filtered));
  } catch (error) {
    console.error("Error in GET /lawyers:", error);
    res.status(500).json({ error: "Failed to fetch lawyers" });
  }
});

// ─── Cases (Client) ───────────────────────────────────────────────────────────
router.get("/cases", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      res.json(ListCasesResponse.parse([]));
      return;
    }

    const cases = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.clientId, userId))
      .orderBy(desc(casesTable.createdAt));

    const users = await db.select().from(usersTable);

    const result = cases.map((c) => {
      const lawyer = c.lawyerId ? users.find((u) => u.id === c.lawyerId) : null;
      return {
        id: c.id,
        title: c.title,
        category: c.category,
        oppositeParty: c.oppositeParty || "",
        status: c.status.toLowerCase().replace(/_/g, "-"),
        statusLabel: c.status.replace(/_/g, " "),
        nextStep: c.nextStep || "Reviewing matter details",
        updatedAt: c.updatedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        progress: c.progress,
        lawyerName: lawyer ? lawyer.fullName : null,
      };
    });

    res.json(ListCasesResponse.parse(result));
  } catch (error) {
    console.error("Error in GET /cases:", error);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

router.post("/cases", async (req, res): Promise<void> => {
  try {
    const parsed = CreateCaseBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const userId = req.auth!.id;
    const caseRef = `CASE-${Date.now()}`;

    if (!db) {
      const item = {
        id: Date.now(),
        title: parsed.data.title,
        category: parsed.data.category,
        oppositeParty: parsed.data.oppositeParty || "",
        status: "created",
        statusLabel: "Created",
        nextStep: "Choose a lawyer for your consultation",
        updatedAt: "Created just now",
        progress: 8,
        lawyerName: null,
      };
      res.status(201).json(CreateCaseResponse.parse(item));
      return;
    }

    const [newCase] = await db
      .insert(casesTable)
      .values({
        caseRef,
        clientId: userId,
        title: parsed.data.title,
        category: parsed.data.category,
        oppositeParty: parsed.data.oppositeParty,
        description: parsed.data.title,
        status: "CREATED",
        progress: 8,
        nextStep: "Choose a lawyer for your consultation",
      })
      .returning();

    const item = {
      id: newCase.id,
      title: newCase.title,
      category: newCase.category,
      oppositeParty: newCase.oppositeParty || "",
      status: "created",
      statusLabel: "Created",
      nextStep: newCase.nextStep || "",
      updatedAt: "Created just now",
      progress: newCase.progress,
      lawyerName: null,
    };

    res.status(201).json(CreateCaseResponse.parse(item));
  } catch (error) {
    console.error("Error in POST /cases:", error);
    res.status(500).json({ error: "Failed to create case" });
  }
});

router.patch("/cases/:id", async (req, res): Promise<void> => {
  try {
    const params = UpdateCaseParams.safeParse(req.params);
    const body = UpdateCaseBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid case update" });
      return;
    }

    const userId = req.auth!.id;
    const caseId = params.data.id;

    const stages: Record<string, { label: string; progress: number; nextStep: string }> = {
      created: { label: "Created", progress: 8, nextStep: "Choose a lawyer for your consultation" },
      "lawyer-assigned": { label: "Lawyer assigned", progress: 18, nextStep: "Prepare for your first consultation" },
      consultation: { label: "Consultation", progress: 30, nextStep: "Share the documents your lawyer requested" },
      "documents-uploaded": { label: "Documents uploaded", progress: 42, nextStep: "Your lawyer will review the documents" },
      "under-review": { label: "Under review", progress: 55, nextStep: "Your lawyer is preparing the next action" },
      "legal-notice": { label: "Legal notice", progress: 67, nextStep: "Review the draft legal notice with your lawyer" },
      "court-filing": { label: "Court filing", progress: 77, nextStep: "Your lawyer will share the filing reference" },
      hearing: { label: "Hearing", progress: 88, nextStep: "Keep your hearing documents ready" },
      resolved: { label: "Resolved", progress: 100, nextStep: "Review your case summary" },
      closed: { label: "Closed", progress: 100, nextStep: "This matter is complete" },
    };

    const stage = stages[body.data.status] ?? stages.created;

    if (db) {
      await db
        .update(casesTable)
        .set({
          status: body.data.status.toUpperCase().replace(/-/g, "_"),
          progress: stage.progress,
          nextStep: stage.nextStep,
          updatedAt: new Date(),
        })
        .where(and(eq(casesTable.id, caseId), eq(casesTable.clientId, userId)));
    }

    const updated = {
      id: caseId,
      title: "Legal Case",
      category: "General",
      oppositeParty: "",
      status: body.data.status,
      ...stage,
      updatedAt: "Updated just now",
      lawyerName: null,
    };

    res.json(UpdateCaseResponse.parse(updated));
  } catch (error) {
    console.error("Error in PATCH /cases/:id:", error);
    res.status(500).json({ error: "Failed to update case" });
  }
});

// ─── Case Requests Pipeline (Client → Lawyer) ─────────────────────────────────
router.post("/case-requests", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    const { caseId, lawyerId, message } = req.body as { caseId: number; lawyerId: number; message?: string };

    if (!caseId || !lawyerId) {
      res.status(400).json({ error: "caseId and lawyerId are required" });
      return;
    }

    if (db) {
      const requestRef = `REQ-${Date.now()}`;
      await db.insert(caseRequestsTable).values({
        requestRef,
        caseId,
        clientId: userId,
        lawyerId,
        status: "PENDING",
        clientMessage: message,
      });

      const [c] = await db.select().from(casesTable).where(eq(casesTable.id, caseId)).limit(1);
      const [client] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

      if (c) {
        await db.update(casesTable).set({ status: "PENDING_LAWYER" }).where(eq(casesTable.id, caseId));
        await notify.newCaseRequest(lawyerId, client?.fullName || "A client", c.title, c.id);
      }
    }

    res.json({ success: true, message: "Case request sent to advocate" });
  } catch (error) {
    console.error("Error in POST /case-requests:", error);
    res.status(500).json({ error: "Failed to create case request" });
  }
});

// ─── Appointments (Client) ────────────────────────────────────────────────────
router.get("/appointments", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      res.json(ListAppointmentsResponse.parse([]));
      return;
    }

    const appts = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.clientId, userId))
      .orderBy(desc(appointmentsTable.createdAt));

    const users = await db.select().from(usersTable);

    const result = appts.map((a) => {
      const lawyer = users.find((u) => u.id === a.lawyerId);
      const lawyerName = lawyer ? lawyer.fullName : "Adv. Rohan Iyer";
      return {
        id: a.id,
        lawyerName,
        lawyerInitials: lawyerName
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        type: a.type === "VIDEO" ? "Video consultation" : "Office visit",
        date: a.date,
        time: a.time,
        status: a.status === "CONFIRMED" ? "Confirmed" : "Pending payment",
        fee: a.fee,
      };
    });

    res.json(ListAppointmentsResponse.parse(result));
  } catch (error) {
    console.error("Error in GET /appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

router.post("/appointments", async (req, res): Promise<void> => {
  try {
    const parsed = CreateAppointmentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const userId = req.auth!.id;
    const apptRef = `APPT-${Date.now()}`;
    const lawyerId = parsed.data.lawyerId;

    let lawyerName = "Advocate";
    if (db) {
      const [lawyer] = await db.select().from(usersTable).where(eq(usersTable.id, lawyerId)).limit(1);
      if (lawyer) lawyerName = lawyer.fullName;

      await db.insert(appointmentsTable).values({
        apptRef,
        clientId: userId,
        lawyerId,
        type: parsed.data.type.toLowerCase().includes("video") ? "VIDEO" : "OFFICE",
        date: parsed.data.date,
        time: parsed.data.time,
        status: "CONFIRMED",
        fee: 1500,
      });

      const [client] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      await notify.appointmentBooked(lawyerId, client?.fullName || "Client", parsed.data.date, parsed.data.time);
    }

    const item = {
      id: Date.now(),
      lawyerName,
      lawyerInitials: lawyerName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      type: parsed.data.type,
      date: parsed.data.date,
      time: parsed.data.time,
      status: "Confirmed",
      fee: 1500,
    };

    res.status(201).json(CreateAppointmentResponse.parse(item));
  } catch (error) {
    console.error("Error in POST /appointments:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// ─── Documents (Client) ───────────────────────────────────────────────────────
router.get("/documents", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      res.json(ListDocumentsResponse.parse([]));
      return;
    }

    const docs = await db
      .select()
      .from(caseDocumentsTable)
      .where(eq(caseDocumentsTable.uploadedByUserId, userId))
      .orderBy(desc(caseDocumentsTable.createdAt));

    const cases = await db.select().from(casesTable);

    const result = docs.map((d) => {
      const c = cases.find((entry) => entry.id === d.caseId);
      return {
        id: d.id,
        name: d.name,
        type: d.fileType,
        size: d.fileSize,
        uploadedAt: d.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        caseTitle: c ? c.title : "General Documentation",
      };
    });

    res.json(ListDocumentsResponse.parse(result));
  } catch (error) {
    console.error("Error in GET /documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.post("/documents", async (req, res): Promise<void> => {
  try {
    const parsed = CreateDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const userId = req.auth!.id;
    const docRef = `DOC-${Date.now()}`;

    if (db) {
      const userCases = await db.select().from(casesTable).where(eq(casesTable.clientId, userId)).limit(1);
      const caseId = userCases.length > 0 ? userCases[0].id : 1;

      await db.insert(caseDocumentsTable).values({
        docRef,
        caseId,
        uploadedByUserId: userId,
        uploadedByRole: "CLIENT",
        name: parsed.data.name,
        fileName: `${parsed.data.name.replace(/\s+/g, "_")}.${parsed.data.type.toLowerCase()}`,
        filePath: "",
        fileType: parsed.data.type,
        fileSize: parsed.data.size,
        category: "CLIENT_DOCUMENT",
      });

      if (userCases[0]?.lawyerId) {
        const [client] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        await notify.documentUploaded(
          userCases[0].lawyerId,
          client?.fullName || "Client",
          parsed.data.name,
          userCases[0].title,
          userCases[0].id,
        );
      }
    }

    const item = {
      id: Date.now(),
      ...parsed.data,
      uploadedAt: "Just now",
    };

    res.status(201).json(CreateDocumentResponse.parse(item));
  } catch (error) {
    console.error("Error in POST /documents:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

// ─── Payments (Client) ────────────────────────────────────────────────────────
router.get("/payments", async (req, res): Promise<void> => {
  try {
    const userId = req.auth!.id;
    if (!db) {
      res.json(ListPaymentsResponse.parse([]));
      return;
    }

    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.clientId, userId))
      .orderBy(desc(paymentsTable.createdAt));

    const result = payments.map((p) => ({
      id: p.id,
      description: `Legal service consultation`,
      date: p.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      amount: p.amount,
      status: p.status === "PAID" ? "Paid" : "Pending",
      receipt: p.paymentRef,
    }));

    res.json(ListPaymentsResponse.parse(result));
  } catch (error) {
    console.error("Error in GET /payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// ─── AI Legal Assistant ───────────────────────────────────────────────────────
router.post("/assistant/ask", (req, res) => {
  const parsed = AskAssistantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const question = parsed.data.question.toLowerCase();
  let answer =
    "I can help you understand relevant statutory provisions and connect with a verified advocate. Tell me about what occurred and what state or court jurisdiction is involved.";
  let sources = ["Nyaya Legal Information Framework"];
  if (question.includes("consumer") || question.includes("refund")) {
    answer =
      "For an unresolved consumer transaction, preserve your invoice, payment proof, transaction ID, and merchant correspondence. The Consumer Protection Act, 2019 provides a tiered forum structure (District, State, and National commissions) for swift resolution.";
    sources = ["The Consumer Protection Act, 2019", "Consumer Protection (E-Commerce) Rules, 2020"];
  } else if (question.includes("property") || question.includes("land") || question.includes("boundary")) {
    answer =
      "For property matters, organize the registered sale deed, encumbrance certificate (EC), survey map, and property tax receipts. Avoid unilateral alterations before an advocate conducts a title and boundary search.";
    sources = ["The Transfer of Property Act, 1882", "The Registration Act, 1908"];
  } else if (question.includes("privacy") || question.includes("data") || question.includes("cyber")) {
    answer =
      "For cyber or privacy incidents, securely document digital evidence with timestamps and transaction logs. File a complaint via the National Cyber Crime Reporting Portal (cybercrime.gov.in) and notify the relevant bank or data fiduciary.";
    sources = ["The Information Technology Act, 2000", "The Digital Personal Data Protection Act, 2023"];
  }
  res.json(
    AskAssistantResponse.parse({
      answer,
      sources,
      disclaimer:
        "Nyaya provides legal information and workflow tooling, not formal legal advice. Always consult a verified advocate for your specific matter.",
    }),
  );
});

export default router;