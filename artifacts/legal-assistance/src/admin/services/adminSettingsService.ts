import type { PlatformSettings } from '../types';

export const adminSettingsService = {
  updateSettings(current: PlatformSettings, updates: Partial<PlatformSettings>): PlatformSettings {
    return {
      ...current,
      ...updates,
      general: { ...current.general, ...(updates.general || {}) },
      users: { ...current.users, ...(updates.users || {}) },
      lawyers: { ...current.lawyers, ...(updates.lawyers || {}) },
      notifications: { ...current.notifications, ...(updates.notifications || {}) },
    };
  },

  addSpecialization(current: PlatformSettings, newSpecialization: string): PlatformSettings {
    const trimmed = newSpecialization.trim();
    if (!trimmed || current.lawyers.specializations.includes(trimmed)) return current;
    return {
      ...current,
      lawyers: {
        ...current.lawyers,
        specializations: [...current.lawyers.specializations, trimmed],
      },
    };
  },

  removeSpecialization(current: PlatformSettings, specializationToRemove: string): PlatformSettings {
    return {
      ...current,
      lawyers: {
        ...current.lawyers,
        specializations: current.lawyers.specializations.filter((s) => s !== specializationToRemove),
      },
    };
  },
};
