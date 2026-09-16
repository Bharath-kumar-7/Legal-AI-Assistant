import type { AdminUser, AccountStatus } from '../types';

export const adminUsersService = {
  getUsers(users: AdminUser[], filters?: { search?: string; status?: AccountStatus | 'ALL'; dateRange?: string }): AdminUser[] {
    return users.filter((u) => {
      if (filters?.status && filters.status !== 'ALL' && u.status !== filters.status) {
        return false;
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesId = u.id.toLowerCase().includes(q);
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phone.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail && !matchesPhone) {
          return false;
        }
      }
      return true;
    });
  },

  createUser(users: AdminUser[], data: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin' | 'status'>): AdminUser {
    const newUser: AdminUser = {
      ...data,
      id: `USR${Math.floor(100 + Math.random() * 900)}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLogin: 'Never',
    };
    return newUser;
  },

  updateUser(users: AdminUser[], id: string, data: Partial<AdminUser>): AdminUser[] {
    return users.map((u) => (u.id === id ? { ...u, ...data } : u));
  },

  suspendUser(users: AdminUser[], id: string, reason: string, adminName: string): { updatedUsers: AdminUser[]; targetUser?: AdminUser } {
    let targetUser: AdminUser | undefined;
    const updatedUsers = users.map((u) => {
      if (u.id === id) {
        const updated: AdminUser = {
          ...u,
          status: 'SUSPENDED',
          suspensionReason: reason,
          suspensionHistory: [
            ...(u.suspensionHistory || []),
            {
              date: new Date().toISOString(),
              reason,
              actionBy: adminName,
              type: 'SUSPEND',
            },
          ],
        };
        targetUser = updated;
        return updated;
      }
      return u;
    });
    return { updatedUsers, targetUser };
  },

  restoreUser(users: AdminUser[], id: string, adminName: string): { updatedUsers: AdminUser[]; targetUser?: AdminUser } {
    let targetUser: AdminUser | undefined;
    const updatedUsers = users.map((u) => {
      if (u.id === id) {
        const updated: AdminUser = {
          ...u,
          status: 'ACTIVE',
          suspensionReason: undefined,
          deactivationReason: undefined,
          suspensionHistory: [
            ...(u.suspensionHistory || []),
            {
              date: new Date().toISOString(),
              reason: 'Account restored by administrator.',
              actionBy: adminName,
              type: 'RESTORE',
            },
          ],
        };
        targetUser = updated;
        return updated;
      }
      return u;
    });
    return { updatedUsers, targetUser };
  },

  deactivateUser(users: AdminUser[], id: string, reason: string, adminName: string): { updatedUsers: AdminUser[]; targetUser?: AdminUser } {
    let targetUser: AdminUser | undefined;
    const updatedUsers = users.map((u) => {
      if (u.id === id) {
        const updated: AdminUser = {
          ...u,
          status: 'DEACTIVATED',
          deactivationReason: reason,
          suspensionHistory: [
            ...(u.suspensionHistory || []),
            {
              date: new Date().toISOString(),
              reason,
              actionBy: adminName,
              type: 'DEACTIVATE',
            },
          ],
        };
        targetUser = updated;
        return updated;
      }
      return u;
    });
    return { updatedUsers, targetUser };
  },
};
