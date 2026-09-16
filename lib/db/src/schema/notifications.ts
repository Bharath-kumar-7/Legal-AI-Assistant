import { createInsertSchema } from 'drizzle-zod';
import { pgTable, serial, integer, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod/v4';
import { usersTable } from './users';

export const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  senderUserId: integer('sender_user_id')
    .references(() => usersTable.id, { onDelete: 'set null' }),
  senderRole: text('sender_role').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  source: text('source').notNull(),
  relatedCaseId: integer('related_case_id'),
  relatedCaseTitle: text('related_case_title'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;
