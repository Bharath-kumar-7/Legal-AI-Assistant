import type { AdminComplaint, ComplaintStatus, ComplaintCategory } from '../types';

export const adminReportsService = {
  getComplaints(
    complaints: AdminComplaint[],
    filters?: {
      search?: string;
      status?: ComplaintStatus | 'ALL';
      category?: ComplaintCategory | 'ALL';
    }
  ): AdminComplaint[] {
    return complaints.filter((c) => {
      if (filters?.status && filters.status !== 'ALL' && c.status !== filters.status) {
        return false;
      }
      if (filters?.category && filters.category !== 'ALL' && c.category !== filters.category) {
        return false;
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesReporter = c.reportedBy.name.toLowerCase().includes(q);
        const matchesTarget = c.reportedUser.name.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        if (!matchesId && !matchesReporter && !matchesTarget && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  },

  updateComplaintStatus(
    complaints: AdminComplaint[],
    id: string,
    status: ComplaintStatus,
    adminNotes: string,
    adminId: string
  ): { updatedComplaints: AdminComplaint[]; targetComplaint?: AdminComplaint } {
    let targetComplaint: AdminComplaint | undefined;
    const isResolving = status === 'RESOLVED' || status === 'REJECTED';
    const updatedComplaints = complaints.map((c) => {
      if (c.id === id) {
        const updated: AdminComplaint = {
          ...c,
          status,
          adminNotes: adminNotes || c.adminNotes,
          updatedAt: new Date().toISOString(),
          ...(isResolving ? { resolvedBy: adminId, resolvedAt: new Date().toISOString() } : {}),
        };
        targetComplaint = updated;
        return updated;
      }
      return c;
    });
    return { updatedComplaints, targetComplaint };
  },

  addAdminNote(complaints: AdminComplaint[], id: string, note: string): AdminComplaint[] {
    return complaints.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          adminNotes: c.adminNotes ? `${c.adminNotes}\n---\n${note}` : note,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
  },
};
