import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { casesTable } from "./cases";

export const caseMessagesTable = pgTable("case_messages", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id")
    .notNull()
    .references(() => casesTable.id, { onDelete: "cascade" }),
  senderUserId: integer("sender_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  // CLIENT | LAWYER
  senderRole: text("sender_role").notNull(),
  text: text("text").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseMessageSchema = createInsertSchema(caseMessagesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertCaseMessage = z.infer<typeof insertCaseMessageSchema>;
export type CaseMessage = typeof caseMessagesTable.$inferSelect;
