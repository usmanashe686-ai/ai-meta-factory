import { create } from 'zustand';

interface PlatformState {
  platform: 'web' | 'mobile' | 'desktop' | 'game' | 'api' | 'iot';
  stack: string;
  setPlatform: (platform: 'web' | 'mobile' | 'desktop' | 'game' | 'api' | 'iot') => void;
  setStack: (stack: string) => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
  platform: 'web',
  stack: 'React',
  setPlatform: (platform) => set({ platform }),
  setStack: (stack) => set({ stack }),
}));
