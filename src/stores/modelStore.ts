import { create } from 'zustand';

interface ModelState {
  nickname: string;
  url: string;
  isDownloading: boolean;
  selectedModelUri: string | null;
  selectedModelName: string | null;
  setNickname: (nickname: string) => void;
  setUrl: (url: string) => void;
  setIsDownloading: (isDownloading: boolean) => void;
  setSelectedModelUri: (uri: string | null) => void;
  setSelectedModelName: (name: string | null) => void;
  reset: () => void;
}

export const useModelStore = create<ModelState>((set) => ({
  nickname: '',
  url: '',
  isDownloading: false,
  selectedModelUri: null,
  selectedModelName: null,
  setNickname: (nickname) => set({ nickname }),
  setUrl: (url) => set({ url }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setSelectedModelUri: (uri) => set({ selectedModelUri: uri }),
  setSelectedModelName: (name) => set({ selectedModelName: name }),
  reset: () => set({ nickname: '', url: '', isDownloading: false, selectedModelUri: null, selectedModelName: null }),
}));
