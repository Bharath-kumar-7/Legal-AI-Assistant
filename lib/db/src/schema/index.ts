// Export your models here. Add one export per file
// export * from "./posts";
//
// Each model/table should ideally be split into different files.
// Each model/table should define a Drizzle table, insert schema, and types:
//
//   import { pgTable, text, serial } from "drizzle-orm/pg-core";
//   import { createInsertSchema } from "drizzle-zod";
//   import { z } from "zod/v4";
//
//   export const postsTable = pgTable("posts", {
//     id: serial("id").primaryKey(),
//     title: text("title").notNull(),
//   });
//
//   export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true });
//   export type InsertPost = z.infer<typeof insertPostSchema>;
//   export type Post = typeof postsTable.$inferSelect;

export * from "./users";
export * from "./user_profiles";
export * from "./otp_codes";
export * from "./lawyer_profiles";
export * from "./availability_slots";
export * from "./cases";
export * from "./case_requests";
export * from "./case_documents";
export * from "./case_notes";
export * from "./case_messages";
export * from "./appointments";
export * from "./payments";
export * from "./notifications";
export * from "./audit_logs";