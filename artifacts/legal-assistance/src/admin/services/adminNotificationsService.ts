import type { AdminNotification, NotificationAudience, NotificationPriority } from '../types';

export const adminNotificationsService = {
  createNotification(
    notifications: AdminNotification[],
    data: {
      title: string;
      message: string;
      audience: NotificationAudience;
      targetId?: string;
      priority: NotificationPriority;
      startDate?: string;
      endDate?: string;
      createdBy: string;
    }
  ): AdminNotification {
    const newNotification: AdminNotification = {
      id: `NTF${Math.floor(400 + Math.random() * 600)}`,
      title: data.title,
      message: data.message,
      audience: data.audience,
      targetId: data.targetId,
      priority: data.priority,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate,
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    return newNotification;
  },

  toggleNotificationStatus(notifications: AdminNotification[], id: string): AdminNotification[] {
    return notifications.map((n) => (n.id === id ? { ...n, isActive: !n.isActive } : n));
  },

  deleteNotification(notifications: AdminNotification[], id: string): AdminNotification[] {
    return notifications.filter((n) => n.id !== id);
  },
};
