import { create } from 'zustand';

interface PlatformState {
  platform: 'web' | 'mobile' | 'desktop';
  stack: string;
  setPlatform: (platform: 'web' | 'mobile' | 'desktop') => void;
  setStack: (stack: string) => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
  platform: 'web',
  stack: 'React',
  setPlatform: (platform) => set({ platform }),
  setStack: (stack) => set({ stack }),
}));
