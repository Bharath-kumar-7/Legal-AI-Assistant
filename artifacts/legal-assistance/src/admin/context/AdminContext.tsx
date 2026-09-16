import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import type {
  AdminUser,
  AdminLawyerProfile,
  AdminComplaint,
  AdminAuditLog,
  AdminNotification,
  PlatformSettings,
  DashboardStats,
  ComplaintStatus,
} from '../types';
import {
  initialUsers,
  initialLawyers,
  initialComplaints,
  initialAuditLogs,
  initialNotifications,
  initialSettings,
} from '../mockData';
import { adminUsersService } from '../services/adminUsersService';
import { adminLawyersService } from '../services/adminLawyersService';
import { adminReportsService } from '../services/adminReportsService';
import { adminNotificationsService } from '../services/adminNotificationsService';
import { adminAuditService } from '../services/adminAuditService';
import { adminSettingsService } from '../services/adminSettingsService';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  tone: 'success' | 'error' | 'info' | 'warning';
}

interface AdminContextType {
  users: AdminUser[];
  lawyers: AdminLawyerProfile[];
  complaints: AdminComplaint[];
  auditLogs: AdminAuditLog[];
  notifications: AdminNotification[];
  settings: PlatformSettings;
  stats: DashboardStats;
  toasts: ToastMessage[];
  addToast: (title: string, message?: string, tone?: ToastMessage['tone']) => void;
  removeToast: (id: string) => void;

  // User Actions
  createUser: (data: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin' | 'status'>) => void;
  updateUser: (id: string, data: Partial<AdminUser>) => void;
  suspendUser: (id: string, reason: string) => void;
  restoreUser: (id: string) => void;
  deactivateUser: (id: string, reason: string) => void;

  // Lawyer Actions
  approveLawyer: (id: string) => void;
  rejectLawyer: (id: string, reason: string) => void;
  suspendLawyer: (id: string, reason: string) => void;
  restoreLawyer: (id: string) => void;
  deactivateLawyer: (id: string, reason: string) => void;

  // Complaint Actions
  updateComplaintStatus: (id: string, status: ComplaintStatus, adminNotes: string) => void;
  addComplaintNote: (id: string, note: string) => void;

  // Notification Actions
  createNotification: (data: Parameters<typeof adminNotificationsService.createNotification>[1]) => void;
  toggleNotification: (id: string) => void;
  deleteNotification: (id: string) => void;

  // Settings Actions
  updateSettings: (updates: Partial<PlatformSettings>) => void;
  addSpecialization: (spec: string) => void;
  removeSpecialization: (spec: string) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode; currentAdminName?: string; currentAdminId?: string }> = ({
  children,
  currentAdminName = 'Chief Administrator',
  currentAdminId = 'ADM001',
}) => {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [lawyers, setLawyers] = useState<AdminLawyerProfile[]>(initialLawyers);
  const [complaints, setComplaints] = useState<AdminComplaint[]>(initialComplaints);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications);
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ─── Real Database Hydration ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('nyaya_token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch real users (clients) from PostgreSQL
    fetch('/api/admin/users', { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
      })
      .catch(() => {});

    // Fetch real lawyers from PostgreSQL
    fetch('/api/admin/lawyers', { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLawyers(
            data.map((l: any) => ({
              id: l.id,
              userId: String(l.userId),
              name: l.name,
              email: l.email,
              phone: l.phone || '+91 98200 44556',
              address: l.location || 'India',
              registrationNumber: l.barCouncilNumber || 'PENDING',
              specialization: (l.practiceAreas && l.practiceAreas[0]) || 'Civil Law',
              experienceYears: l.yearsOfExperience || 0,
              bio: l.bio || 'Advocate practicing before Indian courts.',
              verificationStatus: l.verificationStatus === 'VERIFIED' ? 'APPROVED' : l.verificationStatus,
              accountStatus: l.accountStatus || 'ACTIVE',
              createdAt: l.submittedAt,
              documents: [],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const addToast = useCallback((title: string, message?: string, tone: ToastMessage['tone'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const logAudit = useCallback(
    (entry: Omit<AdminAuditLog, 'id' | 'timestamp' | 'adminId' | 'adminName'>) => {
      setAuditLogs((prev) =>
        adminAuditService.createLogEntry(prev, {
          ...entry,
          adminId: currentAdminId,
          adminName: currentAdminName,
        })
      );
    },
    [currentAdminId, currentAdminName]
  );

  // User Handlers
  const createUser = useCallback(
    (data: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin' | 'status'>) => {
      const newUser = adminUsersService.createUser(users, data);
      setUsers((prev) => [newUser, ...prev]);
      logAudit({
        action: 'CREATE_USER',
        entityType: 'USER',
        entityId: newUser.id,
        description: `Created new ${newUser.role} account for ${newUser.name} (${newUser.email}).`,
        newValue: { name: newUser.name, email: newUser.email, role: newUser.role },
      });
      addToast('User created successfully', `Account for ${newUser.name} has been provisioned.`);
    },
    [users, logAudit, addToast]
  );

  const updateUser = useCallback(
    (id: string, data: Partial<AdminUser>) => {
      const existing = users.find((u) => u.id === id);
      setUsers((prev) => adminUsersService.updateUser(prev, id, data));
      logAudit({
        action: 'UPDATE_USER',
        entityType: 'USER',
        entityId: id,
        description: `Updated profile details for user ${existing?.name || id}.`,
        oldValue: existing ? { name: existing.name, phone: existing.phone } : undefined,
        newValue: data,
      });
      addToast('User updated', `Details for ${existing?.name || id} have been saved.`);
    },
    [users, logAudit, addToast]
  );

  const suspendUser = useCallback(
    (id: string, reason: string) => {
      const { updatedUsers, targetUser } = adminUsersService.suspendUser(users, id, reason, currentAdminName);
      setUsers(updatedUsers);
      logAudit({
        action: 'SUSPEND_USER',
        entityType: 'USER',
        entityId: id,
        description: `Suspended user ${targetUser?.name || id}.`,
        reason,
        oldValue: 'status: ACTIVE',
        newValue: 'status: SUSPENDED',
      });
      addToast('Account suspended', `${targetUser?.name || id} has been suspended.`, 'warning');
    },
    [users, currentAdminName, logAudit, addToast]
  );

  const restoreUser = useCallback(
    (id: string) => {
      const { updatedUsers, targetUser } = adminUsersService.restoreUser(users, id, currentAdminName);
      setUsers(updatedUsers);
      logAudit({
        action: 'RESTORE_USER',
        entityType: 'USER',
        entityId: id,
        description: `Restored user account for ${targetUser?.name || id}.`,
        oldValue: 'status: SUSPENDED/DEACTIVATED',
        newValue: 'status: ACTIVE',
      });
      addToast('Account restored', `${targetUser?.name || id} is now active.`);
    },
    [users, currentAdminName, logAudit, addToast]
  );

  const deactivateUser = useCallback(
    (id: string, reason: string) => {
      const { updatedUsers, targetUser } = adminUsersService.deactivateUser(users, id, reason, currentAdminName);
      setUsers(updatedUsers);
      logAudit({
        action: 'DEACTIVATE_USER',
        entityType: 'USER',
        entityId: id,
        description: `Soft-deleted / deactivated account ${targetUser?.name || id}.`,
        reason,
        oldValue: 'status: ACTIVE',
        newValue: 'status: DEACTIVATED',
      });
      addToast('Account deactivated', `${targetUser?.name || id} has been soft-deleted.`, 'error');
    },
    [users, currentAdminName, logAudit, addToast]
  );

  // Lawyer Handlers
  const approveLawyer = useCallback(
    (id: string) => {
      const { updatedLawyers, targetLawyer } = adminLawyersService.approveLawyer(lawyers, id, currentAdminId);
      setLawyers(updatedLawyers);
      logAudit({
        action: 'APPROVE_LAWYER',
        entityType: 'LAWYER',
        entityId: id,
        description: `Approved bar credentials for ${targetLawyer?.name || id} (Reg: ${targetLawyer?.registrationNumber}).`,
        oldValue: 'verificationStatus: PENDING',
        newValue: 'verificationStatus: APPROVED',
      });
      addToast('Lawyer approved', `${targetLawyer?.name || id} is now verified and active.`);

      // Sync with PostgreSQL
      const token = localStorage.getItem('nyaya_token');
      fetch(`/api/admin/lawyers/${id}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ verificationStatus: 'VERIFIED' }),
      }).catch(() => {});
    },
    [lawyers, currentAdminId, logAudit, addToast]
  );

  const rejectLawyer = useCallback(
    (id: string, reason: string) => {
      const { updatedLawyers, targetLawyer } = adminLawyersService.rejectLawyer(lawyers, id, reason, currentAdminId);
      setLawyers(updatedLawyers);
      logAudit({
        action: 'REJECT_LAWYER',
        entityType: 'LAWYER',
        entityId: id,
        description: `Rejected verification request for ${targetLawyer?.name || id}.`,
        reason,
        oldValue: 'verificationStatus: PENDING',
        newValue: 'verificationStatus: REJECTED',
      });
      addToast('Lawyer verification rejected', `Rejection recorded for ${targetLawyer?.name || id}.`, 'error');

      // Sync with PostgreSQL
      const token = localStorage.getItem('nyaya_token');
      fetch(`/api/admin/lawyers/${id}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ verificationStatus: 'REJECTED', message: reason }),
      }).catch(() => {});
    },
    [lawyers, currentAdminId, logAudit, addToast]
  );

  const suspendLawyer = useCallback(
    (id: string, reason: string) => {
      const { updatedLawyers, targetLawyer } = adminLawyersService.suspendLawyer(lawyers, id, reason);
      setLawyers(updatedLawyers);
      logAudit({
        action: 'SUSPEND_LAWYER',
        entityType: 'LAWYER',
        entityId: id,
        description: `Suspended advocate ${targetLawyer?.name || id}.`,
        reason,
        oldValue: 'accountStatus: ACTIVE',
        newValue: 'accountStatus: SUSPENDED',
      });
      addToast('Lawyer suspended', `${targetLawyer?.name || id} account suspended.`, 'warning');
    },
    [lawyers, logAudit, addToast]
  );

  const restoreLawyer = useCallback(
    (id: string) => {
      const { updatedLawyers, targetLawyer } = adminLawyersService.restoreLawyer(lawyers, id);
      setLawyers(updatedLawyers);
      logAudit({
        action: 'RESTORE_LAWYER',
        entityType: 'LAWYER',
        entityId: id,
        description: `Restored advocate account for ${targetLawyer?.name || id}.`,
        oldValue: 'accountStatus: SUSPENDED',
        newValue: 'accountStatus: ACTIVE',
      });
      addToast('Lawyer restored', `${targetLawyer?.name || id} account is now active.`);
    },
    [lawyers, logAudit, addToast]
  );

  const deactivateLawyer = useCallback(
    (id: string, reason: string) => {
      const { updatedLawyers, targetLawyer } = adminLawyersService.deactivateLawyer(lawyers, id, reason);
      setLawyers(updatedLawyers);
      logAudit({
        action: 'DEACTIVATE_LAWYER',
        entityType: 'LAWYER',
        entityId: id,
        description: `Deactivated advocate profile for ${targetLawyer?.name || id}.`,
        reason,
        oldValue: 'accountStatus: ACTIVE',
        newValue: 'accountStatus: DEACTIVATED',
      });
      addToast('Lawyer deactivated', `${targetLawyer?.name || id} soft-deleted.`, 'error');
    },
    [lawyers, logAudit, addToast]
  );

  // Complaint Handlers
  const updateComplaintStatus = useCallback(
    (id: string, status: ComplaintStatus, adminNotes: string) => {
      const { updatedComplaints, targetComplaint } = adminReportsService.updateComplaintStatus(
        complaints,
        id,
        status,
        adminNotes,
        currentAdminId
      );
      setComplaints(updatedComplaints);
      logAudit({
        action: status === 'RESOLVED' ? 'RESOLVE_COMPLAINT' : status === 'REJECTED' ? 'REJECT_COMPLAINT' : 'UPDATE_USER',
        entityType: 'COMPLAINT',
        entityId: id,
        description: `Updated complaint ${id} status to ${status}.`,
        reason: adminNotes,
        newValue: { status, adminNotes },
      });
      addToast('Complaint status updated', `Complaint ${id} is now ${status}.`);
    },
    [complaints, currentAdminId, logAudit, addToast]
  );

  const addComplaintNote = useCallback(
    (id: string, note: string) => {
      setComplaints((prev) => adminReportsService.addAdminNote(prev, id, note));
      addToast('Note recorded', `Internal note added to complaint ${id}.`, 'info');
    },
    [addToast]
  );

  // Notification Handlers
  const createNotification = useCallback(
    (data: Parameters<typeof adminNotificationsService.createNotification>[1]) => {
      const ntf = adminNotificationsService.createNotification(notifications, data);
      setNotifications((prev) => [ntf, ...prev]);
      logAudit({
        action: 'CREATE_NOTIFICATION',
        entityType: 'NOTIFICATION',
        entityId: ntf.id,
        description: `Created announcement "${ntf.title}" for audience ${ntf.audience}.`,
        newValue: { title: ntf.title, audience: ntf.audience, priority: ntf.priority },
      });
      addToast('Notification published', `Announcement "${ntf.title}" is active.`);
    },
    [notifications, logAudit, addToast]
  );

  const toggleNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => adminNotificationsService.toggleNotificationStatus(prev, id));
      addToast('Status updated', `Notification status toggled.`);
    },
    [addToast]
  );

  const deleteNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => adminNotificationsService.deleteNotification(prev, id));
      addToast('Notification removed', `Announcement deleted.`, 'info');
    },
    [addToast]
  );

  // Settings Handlers
  const updateSettings = useCallback(
    (updates: Partial<PlatformSettings>) => {
      setSettings((prev) => adminSettingsService.updateSettings(prev, updates));
      logAudit({
        action: 'UPDATE_SETTINGS',
        entityType: 'SETTINGS',
        entityId: 'SYSTEM_SETTINGS',
        description: 'Updated platform settings configuration.',
      });
      addToast('Settings saved', 'Platform configuration updated successfully.');
    },
    [logAudit, addToast]
  );

  const addSpecialization = useCallback(
    (spec: string) => {
      setSettings((prev) => adminSettingsService.addSpecialization(prev, spec));
      addToast('Specialization added', `"${spec}" added to lawyer specializations.`);
    },
    [addToast]
  );

  const removeSpecialization = useCallback(
    (spec: string) => {
      setSettings((prev) => adminSettingsService.removeSpecialization(prev, spec));
      addToast('Specialization removed', `Removed specialization.`, 'info');
    },
    [addToast]
  );

  // Real-time calculated KPI Stats
  const stats: DashboardStats = useMemo(() => {
    return {
      users: {
        total: users.length,
        active: users.filter((u) => u.status === 'ACTIVE').length,
        suspended: users.filter((u) => u.status === 'SUSPENDED').length,
        deactivated: users.filter((u) => u.status === 'DEACTIVATED').length,
      },
      lawyers: {
        total: lawyers.length,
        active: lawyers.filter((l) => l.accountStatus === 'ACTIVE' && l.verificationStatus === 'APPROVED').length,
        pendingVerification: lawyers.filter((l) => l.verificationStatus === 'PENDING').length,
        rejected: lawyers.filter((l) => l.verificationStatus === 'REJECTED').length,
        suspended: lawyers.filter((l) => l.accountStatus === 'SUSPENDED').length,
      },
      reports: {
        pending: complaints.filter((c) => c.status === 'PENDING').length,
        underReview: complaints.filter((c) => c.status === 'UNDER_REVIEW').length,
        resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
      },
    };
  }, [users, lawyers, complaints]);

  const value = useMemo(
    () => ({
      users,
      lawyers,
      complaints,
      auditLogs,
      notifications,
      settings,
      stats,
      toasts,
      addToast,
      removeToast,
      createUser,
      updateUser,
      suspendUser,
      restoreUser,
      deactivateUser,
      approveLawyer,
      rejectLawyer,
      suspendLawyer,
      restoreLawyer,
      deactivateLawyer,
      updateComplaintStatus,
      addComplaintNote,
      createNotification,
      toggleNotification,
      deleteNotification,
      updateSettings,
      addSpecialization,
      removeSpecialization,
    }),
    [
      users,
      lawyers,
      complaints,
      auditLogs,
      notifications,
      settings,
      stats,
      toasts,
      addToast,
      removeToast,
      createUser,
      updateUser,
      suspendUser,
      restoreUser,
      deactivateUser,
      approveLawyer,
      rejectLawyer,
      suspendLawyer,
      restoreLawyer,
      deactivateLawyer,
      updateComplaintStatus,
      addComplaintNote,
      createNotification,
      toggleNotification,
      deleteNotification,
      updateSettings,
      addSpecialization,
      removeSpecialization,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
