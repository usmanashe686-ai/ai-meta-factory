import { create } from 'zustand';

type TabType = 'editor' | 'ai' | 'preview';

interface UIState {
  isAIPanelOpen: boolean;
  activeTab: TabType;

  toggleAIPanel: () => void;
  setActiveTab: (tab: TabType) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAIPanelOpen: false,
  activeTab: 'editor',

  toggleAIPanel: () =>
    set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),

  setActiveTab: (tab) =>
    set({ activeTab: tab }),
}));
