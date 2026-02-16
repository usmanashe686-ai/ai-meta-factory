import { create } from 'zustand';

interface UIState {
  isAIPanelOpen: boolean;
  theme: 'dark' | 'light';
  toggleAIPanel: () => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAIPanelOpen: false,
  theme: 'dark',
  toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
