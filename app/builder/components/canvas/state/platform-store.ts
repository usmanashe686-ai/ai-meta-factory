'use client';

import { create } from 'zustand';

export type Platform = 'web' | 'mobile' | 'desktop' | 'game' | 'api' | 'iot';

interface PlatformState {
  platform: Platform;
  framework: string;
  setPlatform: (platform: Platform) => void;
  setFramework: (framework: string) => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
  platform: 'web',
  framework: 'react',
  setPlatform: (platform) => set({ platform }),
  setFramework: (framework) => set({ framework }),
}));
