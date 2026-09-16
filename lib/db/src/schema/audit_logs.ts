import { createInsertSchema } from 'drizzle-zod';
import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod/v4';
import { usersTable } from './users';

export const auditLogsTable = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorUserId: integer('actor_user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  description: text('description').notNull(),
  metadata: text('metadata').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;
