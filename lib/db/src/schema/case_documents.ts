import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { casesTable } from "./cases";

export const caseDocumentsTable = pgTable("case_documents", {
  id: serial("id").primaryKey(),
  docRef: text("doc_ref").notNull().unique(),
  caseId: integer("case_id")
    .notNull()
    .references(() => casesTable.id, { onDelete: "cascade" }),
  uploadedByUserId: integer("uploaded_by_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  // CLIENT | LAWYER | COURT | ADMIN
  uploadedByRole: text("uploaded_by_role").notNull(),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: text("file_size").notNull(),
  // CLIENT_DOCUMENT | LAWYER_DOCUMENT | COURT_DOCUMENT | NOTICE | AGREEMENT | EVIDENCE | OTHER
  category: text("category").notNull().default("OTHER"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseDocumentSchema = createInsertSchema(caseDocumentsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertCaseDocument = z.infer<typeof insertCaseDocumentSchema>;
export type CaseDocument = typeof caseDocumentsTable.$inferSelect;
