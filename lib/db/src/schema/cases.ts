import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  caseRef: text("case_ref").notNull().unique(), // e.g. CASE-10024
  clientId: integer("client_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  lawyerId: integer("lawyer_id")
    .references(() => usersTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  oppositeParty: text("opposite_party"),
  description: text("description").notNull(),
  // CREATED | PENDING_LAWYER | ACTIVE | LEGAL_NOTICE | CONSULTATION_SCHEDULED |
  // DOCUMENTS_UPLOADED | UNDER_REVIEW | COURT_FILING | HEARING | RESOLVED | CLOSED
  status: text("status").notNull().default("CREATED"),
  progress: integer("progress").notNull().default(0),
  nextStep: text("next_step"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof casesTable.$inferSelect;
