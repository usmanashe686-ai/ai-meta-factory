import { create } from 'zustand';

export type TabType = 'files' | 'editor' | 'ai' | 'preview';

interface UIState {
  // Tab State
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  // Panel & Theme State
  isAIPanelOpen: boolean;
  toggleAIPanel: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Defaults
  activeTab: 'editor',
  isAIPanelOpen: false,
  theme: 'dark',

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
