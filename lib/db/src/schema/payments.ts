import { createInsertSchema } from 'drizzle-zod';
import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod/v4';
import { usersTable } from './users';
import { casesTable } from './cases';
import { appointmentsTable } from './appointments';

export const paymentsTable = pgTable('payments', {
  id: serial('id').primaryKey(),
  paymentRef: text('payment_ref').notNull().unique(),
  caseId: integer('case_id')
    .references(() => casesTable.id, { onDelete: 'set null' }),
  appointmentId: integer('appointment_id')
    .references(() => appointmentsTable.id, { onDelete: 'set null' }),
  clientId: integer('client_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  lawyerId: integer('lawyer_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  type: text('type').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('PENDING'),
  paymentMethod: text('payment_method'),
  transactionId: text('transaction_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
