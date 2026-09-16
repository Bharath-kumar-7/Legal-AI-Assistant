import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { casesTable } from "./cases";

export const caseRequestsTable = pgTable("case_requests", {
  id: serial("id").primaryKey(),
  requestRef: text("request_ref").notNull().unique(),
  caseId: integer("case_id")
    .notNull()
    .references(() => casesTable.id, { onDelete: "cascade" }),
  clientId: integer("client_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  lawyerId: integer("lawyer_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  // PENDING | ACCEPTED | REJECTED | INFO_REQUESTED | WITHDRAWN
  status: text("status").notNull().default("PENDING"),
  clientMessage: text("client_message"),
  rejectReason: text("reject_reason"),
  infoRequest: text("info_request"),
  conflictChecked: boolean("conflict_checked").notNull().default(false),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseRequestSchema = createInsertSchema(caseRequestsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCaseRequest = z.infer<typeof insertCaseRequestSchema>;
export type CaseRequest = typeof caseRequestsTable.$inferSelect;
