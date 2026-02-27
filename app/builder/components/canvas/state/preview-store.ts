import { create } from 'zustand';

interface PreviewState {
  isPreviewVisible: boolean;
  previewMode: 'desktop' | 'mobile' | 'tablet';
  autoRefresh: boolean;
  lastError: string | null;
  consoleOutput: string[];
  refreshCounter: number;
  togglePreview: () => void;
  setPreviewMode: (mode: 'desktop' | 'mobile' | 'tablet') => void;
  triggerRefresh: () => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  isPreviewVisible: true,
  previewMode: 'desktop',
  autoRefresh: true,
  lastError: null,
  consoleOutput: [],
  refreshCounter: 0,
  togglePreview: () => set((s) => ({ isPreviewVisible: !s.isPreviewVisible })),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  triggerRefresh: () => set((state) => ({ refreshCounter: state.refreshCounter + 1 })),
}));
