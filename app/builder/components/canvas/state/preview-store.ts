'use client';
import { create } from 'zustand';
type PreviewStore = {
  isPreviewVisible: boolean;
  previewMode: 'desktop' | 'mobile' | 'tablet';
  autoRefresh: boolean;
  lastError: string | null;
  consoleOutput: string[];
  togglePreview: () => void;
  setPreviewMode: (mode: 'desktop' | 'mobile' | 'tablet') => void;
};
export const usePreviewStore = create<PreviewStore>((set) => ({
  isPreviewVisible: true,
  previewMode: 'desktop',
  autoRefresh: true,
  lastError: null,
  consoleOutput: [],
  togglePreview: () => set((s) => ({ isPreviewVisible: !s.isPreviewVisible })),
  setPreviewMode: (mode) => set({ previewMode: mode }),
}));
