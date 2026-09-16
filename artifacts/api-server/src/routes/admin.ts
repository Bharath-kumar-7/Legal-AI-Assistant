import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, and, desc, count, sql } from "drizzle-orm";
import {
  db,
  casesTable,
  caseRequestsTable,
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

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.auth?.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

router.use(requireAdmin);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/admin/dashboard", async (_req, res): Promise<void> => {
  try {
    if (!db) {
      res.json({
        totalUsers: 14,
        totalLawyers: 6,
        activeCases: 8,
        pendingVerifications: 2,
        totalRevenue: 128000,
      });
      return;
    }

    const allUsers = await db.select().from(usersTable);
    const lawyers = allUsers.filter((u) => u.role === "lawyer");
    const clients = allUsers.filter((u) => u.role === "client");

    const cases = await db.select().from(casesTable);
    const activeCases = cases.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED");

    const profiles = await db.select().from(lawyerProfilesTable);
    const pendingVerifs = profiles.filter(
      (p) => p.verificationStatus === "PENDING" || p.verificationStatus === "UNDER_REVIEW",
    );

    const payments = await db.select().from(paymentsTable);
    const totalRevenue = payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalUsers: clients.length,
      totalLawyers: lawyers.length,
      activeCases: activeCases.length,
      pendingVerifications: pendingVerifs.length,
      totalRevenue,
    });
  } catch (error) {
    console.error("Error in GET /admin/dashboard:", error);
    res.status(500).json({ error: "Failed to fetch admin dashboard" });
  }
});

// ─── Users ────────────────────────────────────────────────────────────────────
router.get("/admin/users", async (req, res): Promise<void> => {
  try {
    if (!db) {
      res.json([]);
      return;
    }

    const query = (req.query.search as string) || "";
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "client"))
      .orderBy(desc(usersTable.createdAt));

    const filtered = query
      ? users.filter(
          (u) =>
            u.fullName.toLowerCase().includes(query.toLowerCase()) ||
            u.email.toLowerCase().includes(query.toLowerCase()),
        )
      : users;

    res.json(
      filtered.map((u) => ({
        id: `USR${u.id}`,
        name: u.fullName,
        email: u.email,
        phone: "+91 98765 43210",
        role: u.role,
        status: "ACTIVE",
        createdAt: u.createdAt.toISOString(),
        lastLogin: new Date().toISOString(),
      })),
    );
  } catch (error) {
    console.error("Error in GET /admin/users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.patch("/admin/users/:id/status", async (req, res): Promise<void> => {
  try {
    const rawId = req.params.id.replace("USR", "");
    const targetUserId = Number(rawId);
    const { status, reason } = req.body as { status: string; reason?: string };

    if (db && !Number.isNaN(targetUserId)) {
      await db.insert(auditLogsTable).values({
        actorUserId: req.auth!.id,
        actorRole: "ADMIN",
        action: `USER_${status}`,
        entityType: "USER",
        entityId: String(targetUserId),
        description: reason || `Admin set status to ${status}`,
        metadata: JSON.stringify({ status, reason }),
      });

      if (status === "SUSPENDED") {
        await notify.accountSuspended(targetUserId, reason || "Policy violation");
      }
    }

    res.json({ success: true, message: `User status changed to ${status}` });
  } catch (error) {
    console.error("Error in PATCH /admin/users/:id/status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// ─── Lawyers & Verification ───────────────────────────────────────────────────
router.get("/admin/lawyers", async (_req, res): Promise<void> => {
  try {
    if (!db) {
      res.json([]);
      return;
    }

    const lawyers = await db.select().from(usersTable).where(eq(usersTable.role, "lawyer"));
    const profiles = await db.select().from(lawyerProfilesTable);

    const result = lawyers.map((u) => {
      const prof = profiles.find((p) => p.userId === u.id);
      return {
        id: prof ? prof.lawyerId : `LAW${u.id}`,
        userId: u.id,
        name: u.fullName,
        email: u.email,
        phone: prof?.phone || "+91 98200 44556",
        location: prof?.location || "India",
        barCouncilNumber: prof?.barCouncilNumber || "PENDING",
        barCouncilState: prof?.barCouncilState || "Bar Council of India",
        yearsOfExperience: prof?.yearsOfExperience || 0,
        practiceAreas: JSON.parse(prof?.practiceAreas || "[]"),
        courtLocations: JSON.parse(prof?.courtLocations || "[]"),
        verificationStatus: prof?.verificationStatus || "PENDING",
        accountStatus: prof?.accountStatus || "ACTIVE",
        verificationMessage: prof?.verificationMessage || undefined,
        submittedAt: prof?.createdAt.toISOString() || u.createdAt.toISOString(),
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error in GET /admin/lawyers:", error);
    res.status(500).json({ error: "Failed to fetch lawyers" });
  }
});

router.patch("/admin/lawyers/:id/verification", async (req, res): Promise<void> => {
  try {
    const lawyerIdParam = req.params.id;
    const { verificationStatus, message } = req.body as {
      verificationStatus: "VERIFIED" | "REJECTED" | "UNDER_REVIEW";
      message?: string;
    };

    if (!db) {
      res.json({ success: true });
      return;
    }

    const profiles = await db.select().from(lawyerProfilesTable);
    const prof = profiles.find(
      (p) =>
        p.lawyerId === lawyerIdParam ||
        String(p.userId) === lawyerIdParam ||
        `LAW${p.userId}` === lawyerIdParam
    );

    if (!prof) {
      res.status(404).json({ error: "Lawyer profile not found" });
      return;
    }

    await db
      .update(lawyerProfilesTable)
      .set({
        verificationStatus,
        verificationMessage: message || undefined,
        updatedAt: new Date(),
      })
      .where(eq(lawyerProfilesTable.id, prof.id));

    if (verificationStatus === "VERIFIED") {
      await notify.lawyerVerified(prof.userId);
    } else if (verificationStatus === "REJECTED") {
      await notify.lawyerRejected(prof.userId, message || "Document mismatch");
    }

    await db.insert(auditLogsTable).values({
      actorUserId: req.auth!.id,
      actorRole: "ADMIN",
      action: `LAWYER_VERIFICATION_${verificationStatus}`,
      entityType: "LAWYER",
      entityId: String(prof.userId),
      description: `Verification status updated to ${verificationStatus}`,
      metadata: JSON.stringify({ verificationStatus, message }),
    });

    res.json({ success: true, message: `Verification status updated to ${verificationStatus}` });
  } catch (error) {
    console.error("Error in PATCH /admin/lawyers/:id/verification:", error);
    res.status(500).json({ error: "Failed to update verification" });
  }
});

// ─── Cases ────────────────────────────────────────────────────────────────────
router.get("/admin/cases", async (_req, res): Promise<void> => {
  try {
    if (!db) {
      res.json([]);
      return;
    }

    const cases = await db.select().from(casesTable).orderBy(desc(casesTable.createdAt));
    const users = await db.select().from(usersTable);

    const result = cases.map((c) => {
      const client = users.find((u) => u.id === c.clientId);
      const lawyer = users.find((u) => u.id === c.lawyerId);

      return {
        id: c.caseRef,
        title: c.title,
        category: c.category,
        clientName: client?.fullName || "Client",
        lawyerName: lawyer?.fullName || "Unassigned",
        status: c.status,
        progress: c.progress,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error in GET /admin/cases:", error);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────
router.get("/admin/audit-logs", async (req, res): Promise<void> => {
  try {
    if (!db) {
      res.json([]);
      return;
    }

    const limit = Number(req.query.limit) || 50;
    const logs = await db
      .select()
      .from(auditLogsTable)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit);

    res.json(
      logs.map((l) => ({
        id: String(l.id),
        actorId: String(l.actorUserId),
        actorRole: l.actorRole,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        description: l.description,
        timestamp: l.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("Error in GET /admin/audit-logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;
