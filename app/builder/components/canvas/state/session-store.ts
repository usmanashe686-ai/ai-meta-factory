import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import localforage from 'localforage';

export interface SessionState {
  username: string;
  theme: 'dark' | 'light';
  autoSave: boolean;
  lastOpenedBackupId: string | null;
  selectedModelId: string | null;
  setUsername: (name: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setAutoSave: (enabled: boolean) => void;
  setLastOpenedBackupId: (id: string | null) => void;
  setSelectedModelId: (id: string | null) => void;
}

// Custom storage for zustand persist using localforage
const storage = {
  getItem: async (name: string) => {
    const value = await localforage.getItem(name);
    return value ?? null;
  },
  setItem: async (name: string, value: any) => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    await localforage.removeItem(name);
  },
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      username: 'User',
      theme: 'dark',
      autoSave: true,
      lastOpenedBackupId: null,
      selectedModelId: null,
      setUsername: (name) => set({ username: name }),
      setTheme: (theme) => set({ theme }),
      setAutoSave: (enabled) => set({ autoSave: enabled }),
      setLastOpenedBackupId: (id) => set({ lastOpenedBackupId: id }),
      setSelectedModelId: (id) => set({ selectedModelId: id }),
    }),
    {
      name: 'ai-meta-factory-session',
      storage: storage,
    }
  )
);
