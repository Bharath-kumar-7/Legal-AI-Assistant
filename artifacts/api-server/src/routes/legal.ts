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
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
router.use(requireAuth);

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

const lawyers = [
  {
    id: 1,
    name: "Ananya Mehta",
    initials: "AM",
    specialization: "Family & Matrimonial Law",
    experience: 12,
    location: "New Delhi",
    rating: 4.9,
    reviews: 124,
    fee: 1800,
    verified: true,
    availability: "Available today",
  },
  {
    id: 2,
    name: "Rohan Iyer",
    initials: "RI",
    specialization: "Property & Civil Law",
    experience: 9,
    location: "Bengaluru",
    rating: 4.8,
    reviews: 96,
    fee: 1500,
    verified: true,
    availability: "Next available tomorrow",
  },
  {
    id: 3,
    name: "Priya Sharma",
    initials: "PS",
    specialization: "Consumer & Commercial Law",
    experience: 15,
    location: "Mumbai",
    rating: 4.9,
    reviews: 182,
    fee: 2200,
    verified: true,
    availability: "Available today",
  },
  {
    id: 4,
    name: "Arjun Nair",
    initials: "AN",
    specialization: "Cyber & Technology Law",
    experience: 8,
    location: "Hyderabad",
    rating: 4.7,
    reviews: 71,
    fee: 1600,
    verified: true,
    availability: "Next available Friday",
  },
];

let cases = [
  {
    id: 1,
    title: "Property boundary dispute",
    category: "Property",
    oppositeParty: "Ramesh Kumar",
    status: "under-review",
    statusLabel: "Under review",
    nextStep: "Lawyer review due 18 Aug",
    updatedAt: "Updated 2 hours ago",
    progress: 48,
    lawyerName: "Rohan Iyer",
  },
  {
    id: 2,
    title: "Online purchase refund",
    category: "Consumer",
    oppositeParty: "BrightCart India",
    status: "consultation",
    statusLabel: "Consultation",
    nextStep: "Video consultation on 21 Aug",
    updatedAt: "Updated yesterday",
    progress: 31,
    lawyerName: "Priya Sharma",
  },
  {
    id: 3,
    title: "Employment agreement review",
    category: "Labour",
    oppositeParty: "Northstar Technologies",
    status: "documents-uploaded",
    statusLabel: "Documents uploaded",
    nextStep: "Upload signed offer letter",
    updatedAt: "Updated 3 days ago",
    progress: 22,
    lawyerName: null,
  },
];

let appointments = [
  {
    id: 1,
    lawyerName: "Ananya Mehta",
    lawyerInitials: "AM",
    type: "Video consultation",
    date: "21 Aug 2026",
    time: "11:30 AM",
    status: "Confirmed",
    fee: 1800,
  },
  {
    id: 2,
    lawyerName: "Rohan Iyer",
    lawyerInitials: "RI",
    type: "Office visit",
    date: "28 Aug 2026",
    time: "4:00 PM",
    status: "Pending payment",
    fee: 1500,
  },
];

let documents = [
  {
    id: 1,
    name: "Property deed — survey 104",
    type: "PDF",
    size: "2.4 MB",
    uploadedAt: "12 Aug 2026",
    caseTitle: "Property boundary dispute",
  },
  {
    id: 2,
    name: "Consumer complaint draft",
    type: "DOCX",
    size: "840 KB",
    uploadedAt: "08 Aug 2026",
    caseTitle: "Online purchase refund",
  },
  {
    id: 3,
    name: "Employment offer letter",
    type: "PDF",
    size: "1.1 MB",
    uploadedAt: "05 Aug 2026",
    caseTitle: "Employment agreement review",
  },
];

const payments = [
  {
    id: 1,
    description: "Consultation with Ananya Mehta",
    date: "21 Aug 2026",
    amount: 1800,
    status: "Paid",
    receipt: "NYA-2026-0812",
  },
  {
    id: 2,
    description: "Consultation with Priya Sharma",
    date: "04 Aug 2026",
    amount: 2200,
    status: "Paid",
    receipt: "NYA-2026-0804",
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

router.get("/dashboard", (_req, res) => {
  const data = {
    userName: "Bharath",
    openCases: cases.length,
    upcomingAppointments: appointments.filter((item) => item.status !== "Completed").length,
    documents: documents.length,
    unreadNotifications: 3,
    recentActivity: [
      { id: 1, title: "Case update", detail: "Property boundary dispute moved to lawyer review", timestamp: "2 hours ago", type: "case" },
      { id: 2, title: "Document added", detail: "Property deed — survey 104 is ready for review", timestamp: "Yesterday", type: "document" },
      { id: 3, title: "Appointment confirmed", detail: "Video consultation with Ananya Mehta", timestamp: "Yesterday", type: "appointment" },
    ],
  };
  res.json(GetDashboardResponse.parse(data));
});

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

router.get("/lawyers", (req, res) => {
  const parsed = ListLawyersQueryParams.safeParse(req.query);
  const query = parsed.success ? parsed.data : {};
  const result = lawyers.filter((lawyer) => matches(`${lawyer.name} ${lawyer.specialization} ${lawyer.location}`, query.search) && matches(lawyer.specialization, query.category));
  res.json(ListLawyersResponse.parse(result));
});

router.get("/cases", (_req, res) => {
  res.json(ListCasesResponse.parse(cases));
});

router.post("/cases", (req, res) => {
  const parsed = CreateCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const item = {
    id: Math.max(...cases.map((entry) => entry.id), 0) + 1,
    title: parsed.data.title,
    category: parsed.data.category,
    oppositeParty: parsed.data.oppositeParty,
    status: "created",
    statusLabel: "Created",
    nextStep: "Choose a lawyer for your consultation",
    updatedAt: "Created just now",
    progress: 8,
    lawyerName: null,
  };
  cases = [item, ...cases];
  res.status(201).json(CreateCaseResponse.parse(item));
});

router.patch("/cases/:id", (req, res) => {
  const params = UpdateCaseParams.safeParse(req.params);
  const body = UpdateCaseBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid case update" });
    return;
  }
  const index = cases.findIndex((entry) => entry.id === params.data.id);
  if (index === -1) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
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
  const updated = { ...cases[index], status: body.data.status, ...stage, updatedAt: "Updated just now" };
  cases[index] = updated;
  res.json(UpdateCaseResponse.parse(updated));
});

router.get("/appointments", (_req, res) => {
  res.json(ListAppointmentsResponse.parse(appointments));
});

router.post("/appointments", (req, res) => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const lawyer = lawyers.find((entry) => entry.id === parsed.data.lawyerId) ?? lawyers[0];
  const item = {
    id: Math.max(...appointments.map((entry) => entry.id), 0) + 1,
    lawyerName: lawyer.name,
    lawyerInitials: lawyer.initials,
    type: parsed.data.type,
    date: parsed.data.date,
    time: parsed.data.time,
    status: "Pending payment",
    fee: lawyer.fee,
  };
  appointments = [item, ...appointments];
  res.status(201).json(CreateAppointmentResponse.parse(item));
});

router.get("/documents", (_req, res) => {
  res.json(ListDocumentsResponse.parse(documents));
});

router.post("/documents", (req, res) => {
  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const item = { id: Math.max(...documents.map((entry) => entry.id), 0) + 1, ...parsed.data, uploadedAt: "Just now" };
  documents = [item, ...documents];
  res.status(201).json(CreateDocumentResponse.parse(item));
});

router.get("/payments", (_req, res) => {
  res.json(ListPaymentsResponse.parse(payments));
});

router.post("/assistant/ask", (req, res) => {
  const parsed = AskAssistantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const question = parsed.data.question.toLowerCase();
  let answer = "I can help you find the right legal information and prepare for a conversation with a qualified lawyer. Tell me a little more about what happened, when it happened, and which state it concerns.";
  let sources = ["Nyaya legal information guide"];
  if (question.includes("consumer") || question.includes("refund")) {
    answer = "For an unresolved online purchase or refund issue, keep your invoice, order details, payment proof, chats, and the seller's responses together. The Consumer Protection Act, 2019 may provide a route for seeking redress. A lawyer can help assess limitation periods and the most suitable forum for your specific facts.";
    sources = ["The Consumer Protection Act, 2019", "Consumer Protection (E-Commerce) Rules, 2020"];
  } else if (question.includes("property") || question.includes("land")) {
    answer = "For a property dispute, start by gathering the sale deed, encumbrance certificate, survey records, tax receipts, and any written communications. Avoid signing new documents or making structural changes before a lawyer reviews the records. The exact remedy depends on title, possession, and the nature of the boundary issue.";
    sources = ["The Transfer of Property Act, 1882", "Nyaya property preparation guide"];
  } else if (question.includes("privacy") || question.includes("data") || question.includes("hack")) {
    answer = "Preserve evidence of the incident without altering it: screenshots, emails, dates, device details, and any ticket or complaint number. Change compromised passwords and enable two-factor authentication. The Digital Personal Data Protection Act, 2023 may be relevant, but the right next step depends on what information was exposed and who controlled it.";
    sources = ["The Digital Personal Data Protection Act, 2023", "The Information Technology Act, 2000"];
  }
  res.json(AskAssistantResponse.parse({
    answer,
    sources,
    disclaimer: "Nyaya provides general legal information, not legal advice. Please consult a verified lawyer for advice about your specific situation.",
  }));
});

router.get("/news", (_req, res) => {
  res.json(ListNewsResponse.parse(news));
});

export default router;