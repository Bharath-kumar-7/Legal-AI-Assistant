import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { casesTable } from "./cases";

export const caseNotesTable = pgTable("case_notes", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id")
    .notNull()
    .references(() => casesTable.id, { onDelete: "cascade" }),
  lawyerUserId: integer("lawyer_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseNoteSchema = createInsertSchema(caseNotesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCaseNote = z.infer<typeof insertCaseNoteSchema>;
export type CaseNote = typeof caseNotesTable.$inferSelect;
