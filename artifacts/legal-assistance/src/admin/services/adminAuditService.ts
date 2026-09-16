import type { AdminAuditLog } from '../types';

export const adminAuditService = {
  getAuditLogs(
    logs: AdminAuditLog[],
    filters?: {
      search?: string;
      action?: string;
      entityType?: string;
    }
  ): AdminAuditLog[] {
    return logs.filter((log) => {
      if (filters?.action && filters.action !== 'ALL' && log.action !== filters.action) {
        return false;
      }
      if (filters?.entityType && filters.entityType !== 'ALL' && log.entityType !== filters.entityType) {
        return false;
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesId = log.id.toLowerCase().includes(q);
        const matchesAdmin = log.adminName.toLowerCase().includes(q) || log.adminId.toLowerCase().includes(q);
        const matchesEntity = log.entityId.toLowerCase().includes(q);
        const matchesDesc = log.description.toLowerCase().includes(q);
        if (!matchesId && !matchesAdmin && !matchesEntity && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  },

  createLogEntry(
    logs: AdminAuditLog[],
    entry: Omit<AdminAuditLog, 'id' | 'timestamp'>
  ): AdminAuditLog[] {
    const newLog: AdminAuditLog = {
      ...entry,
      id: `LOG${Math.floor(900 + Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    return [newLog, ...logs];
  },
};
