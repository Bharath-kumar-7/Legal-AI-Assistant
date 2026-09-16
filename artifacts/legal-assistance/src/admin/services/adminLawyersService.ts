import type { AdminLawyerProfile, VerificationStatus, AccountStatus } from '../types';

export const adminLawyersService = {
  getLawyers(
    lawyers: AdminLawyerProfile[],
    filters?: {
      search?: string;
      verificationStatus?: VerificationStatus | 'ALL';
      accountStatus?: AccountStatus | 'ALL';
      specialization?: string;
    }
  ): AdminLawyerProfile[] {
    return lawyers.filter((l) => {
      if (filters?.verificationStatus && filters.verificationStatus !== 'ALL' && l.verificationStatus !== filters.verificationStatus) {
        return false;
      }
      if (filters?.accountStatus && filters.accountStatus !== 'ALL' && l.accountStatus !== filters.accountStatus) {
        return false;
      }
      if (filters?.specialization && filters.specialization !== 'ALL' && l.specialization !== filters.specialization) {
        return false;
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesId = l.id.toLowerCase().includes(q);
        const matchesName = l.name.toLowerCase().includes(q);
        const matchesEmail = l.email.toLowerCase().includes(q);
        const matchesPhone = l.phone.toLowerCase().includes(q);
        const matchesReg = l.registrationNumber.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail && !matchesPhone && !matchesReg) {
          return false;
        }
      }
      return true;
    });
  },

  approveLawyer(lawyers: AdminLawyerProfile[], id: string, adminId: string): { updatedLawyers: AdminLawyerProfile[]; targetLawyer?: AdminLawyerProfile } {
    let targetLawyer: AdminLawyerProfile | undefined;
    const updatedLawyers = lawyers.map((l) => {
      if (l.id === id) {
        const updated: AdminLawyerProfile = {
          ...l,
          verificationStatus: 'APPROVED',
          verifiedBy: adminId,
          verifiedAt: new Date().toISOString(),
          rejectionReason: undefined,
        };
        targetLawyer = updated;
        return updated;
      }
      return l;
    });
    return { updatedLawyers, targetLawyer };
  },

  rejectLawyer(lawyers: AdminLawyerProfile[], id: string, reason: string, adminId: string): { updatedLawyers: AdminLawyerProfile[]; targetLawyer?: AdminLawyerProfile } {
    let targetLawyer: AdminLawyerProfile | undefined;
    const updatedLawyers = lawyers.map((l) => {
      if (l.id === id) {
        const updated: AdminLawyerProfile = {
          ...l,
          verificationStatus: 'REJECTED',
          rejectionReason: reason,
          verifiedBy: adminId,
          verifiedAt: new Date().toISOString(),
        };
        targetLawyer = updated;
        return updated;
      }
      return l;
    });
    return { updatedLawyers, targetLawyer };
  },

  suspendLawyer(lawyers: AdminLawyerProfile[], id: string, reason: string): { updatedLawyers: AdminLawyerProfile[]; targetLawyer?: AdminLawyerProfile } {
    let targetLawyer: AdminLawyerProfile | undefined;
    const updatedLawyers = lawyers.map((l) => {
      if (l.id === id) {
        const updated: AdminLawyerProfile = {
          ...l,
          accountStatus: 'SUSPENDED',
          suspensionReason: reason,
        };
        targetLawyer = updated;
        return updated;
      }
      return l;
    });
    return { updatedLawyers, targetLawyer };
  },

  restoreLawyer(lawyers: AdminLawyerProfile[], id: string): { updatedLawyers: AdminLawyerProfile[]; targetLawyer?: AdminLawyerProfile } {
    let targetLawyer: AdminLawyerProfile | undefined;
    const updatedLawyers = lawyers.map((l) => {
      if (l.id === id) {
        const updated: AdminLawyerProfile = {
          ...l,
          accountStatus: 'ACTIVE',
          suspensionReason: undefined,
          deactivationReason: undefined,
        };
        targetLawyer = updated;
        return updated;
      }
      return l;
    });
    return { updatedLawyers, targetLawyer };
  },

  deactivateLawyer(lawyers: AdminLawyerProfile[], id: string, reason: string): { updatedLawyers: AdminLawyerProfile[]; targetLawyer?: AdminLawyerProfile } {
    let targetLawyer: AdminLawyerProfile | undefined;
    const updatedLawyers = lawyers.map((l) => {
      if (l.id === id) {
        const updated: AdminLawyerProfile = {
          ...l,
          accountStatus: 'DEACTIVATED',
          deactivationReason: reason,
        };
        targetLawyer = updated;
        return updated;
      }
      return l;
    });
    return { updatedLawyers, targetLawyer };
  },
};
