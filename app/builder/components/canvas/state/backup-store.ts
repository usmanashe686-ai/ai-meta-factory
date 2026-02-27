import { create } from 'zustand';
import localforage from 'localforage';
import { useSessionStore } from './session-store';
import { FileNode } from '../types/project.types';

export interface Backup {
  id: string;
  timestamp: number;
  files: FileNode[];
  projectName: string;
  description?: string;
}

interface BackupState {
  backups: Backup[];
  isAutoSaveEnabled: boolean;
  lastSaveTime: number | null;
  addBackup: (files: FileNode[], projectName: string, description?: string) => Promise<void>;
  restoreBackup: (backupId: string) => Promise<Backup | null>;
  deleteBackup: (backupId: string) => Promise<void>;
  clearOldBackups: (maxVersions: number) => Promise<void>;
  toggleAutoSave: (enabled: boolean) => void;
  loadBackups: () => Promise<void>;
}

const backupStorage = localforage.createInstance({
  name: 'ai-meta-factory',
  storeName: 'backups',
});

export const useBackupStore = create<BackupState>((set, get) => ({
  backups: [],
  isAutoSaveEnabled: true,
  lastSaveTime: null,

  loadBackups: async () => {
    const keys = await backupStorage.keys();
    const backups: Backup[] = [];
    for (const key of keys) {
      const backup = await backupStorage.getItem<Backup>(key);
      if (backup) backups.push(backup);
    }
    backups.sort((a, b) => b.timestamp - a.timestamp);
    set({ backups });
  },

  addBackup: async (files, projectName, description) => {
    const timestamp = Date.now();
    const id = `backup-${timestamp}`;
    const backup: Backup = { id, timestamp, files, projectName, description };
    await backupStorage.setItem(id, backup);
    
    // Update session store with this backup as last opened
    useSessionStore.getState().setLastOpenedBackupId(id);
    
    const { backups, clearOldBackups } = get();
    const updated = [backup, ...backups].sort((a,b) => b.timestamp - a.timestamp);
    set({ backups: updated, lastSaveTime: timestamp });
    
    await clearOldBackups(10);
  },

  restoreBackup: async (backupId) => {
    const backup = await backupStorage.getItem<Backup>(backupId);
    return backup || null;
  },

  deleteBackup: async (backupId) => {
    await backupStorage.removeItem(backupId);
    const { backups } = get();
    set({ backups: backups.filter(b => b.id !== backupId) });
  },

  clearOldBackups: async (maxVersions) => {
    const { backups } = get();
    if (backups.length <= maxVersions) return;
    const toDelete = backups.slice(maxVersions);
    for (const backup of toDelete) {
      await backupStorage.removeItem(backup.id);
    }
    set({ backups: backups.slice(0, maxVersions) });
  },

  toggleAutoSave: (enabled) => set({ isAutoSaveEnabled: enabled }),
}));
