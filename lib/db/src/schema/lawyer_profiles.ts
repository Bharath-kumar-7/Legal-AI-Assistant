import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const lawyerProfilesTable = pgTable("lawyer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  lawyerId: text("lawyer_id").notNull().unique(), // e.g. LAW-000101
  barCouncilNumber: text("bar_council_number").notNull(),
  barCouncilState: text("bar_council_state").notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  practiceAreas: text("practice_areas").notNull(),   // JSON stringified array
  courtLocations: text("court_locations").notNull(), // JSON stringified array
  languages: text("languages").notNull(),            // JSON stringified array
  bio: text("bio").notNull(),
  // PENDING | UNDER_REVIEW | VERIFIED | REJECTED
  verificationStatus: text("verification_status").notNull().default("PENDING"),
  verificationMessage: text("verification_message"),
  // ACTIVE | SUSPENDED | DEACTIVATED
  accountStatus: text("account_status").notNull().default("ACTIVE"),
  location: text("location").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLawyerProfileSchema = createInsertSchema(lawyerProfilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLawyerProfile = z.infer<typeof insertLawyerProfileSchema>;
export type LawyerProfile = typeof lawyerProfilesTable.$inferSelect;
