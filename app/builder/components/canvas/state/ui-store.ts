import { create } from 'zustand';

// Defining the allowed tab names precisely
export type TabType = 'files' | 'editor' | 'ai' | 'preview';

interface UIState {
  isAIPanelOpen: boolean;
  activeTab: TabType;
  toggleAIPanel: () => void;
  setActiveTab: (tab: TabType) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAIPanelOpen: false,
  activeTab: 'editor', // Default tab
  toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
