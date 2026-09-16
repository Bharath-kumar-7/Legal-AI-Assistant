import { createInsertSchema } from 'drizzle-zod';
import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod/v4';
import { usersTable } from './users';
import { casesTable } from './cases';

export const appointmentsTable = pgTable('appointments', {
  id: serial('id').primaryKey(),
  apptRef: text('appt_ref').notNull().unique(),
  caseId: integer('case_id')
    .references(() => casesTable.id, { onDelete: 'set null' }),
  clientId: integer('client_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  lawyerId: integer('lawyer_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  type: text('type').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  status: text('status').notNull().default('PENDING'),
  fee: integer('fee').notNull(),
  meetingLink: text('meeting_link'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
