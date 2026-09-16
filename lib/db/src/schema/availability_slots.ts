import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const availabilitySlotsTable = pgTable("availability_slots", {
  id: serial("id").primaryKey(),
  lawyerUserId: integer("lawyer_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  // MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY
  day: text("day").notNull(),
  startTime: text("start_time").notNull(), // e.g. '09:00'
  endTime: text("end_time").notNull(),     // e.g. '17:00'
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAvailabilitySlotSchema = createInsertSchema(availabilitySlotsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAvailabilitySlot = z.infer<typeof insertAvailabilitySlotSchema>;
export type AvailabilitySlot = typeof availabilitySlotsTable.$inferSelect;
