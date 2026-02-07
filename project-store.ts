import { create } from "zustand";

export interface File {
  name: string;
  content: string;
  language?: string;
  aiGenerated?: boolean;
}

export interface ProjectStore {
  files: Record<string, File>;
  activeFile: File | null;
  stack: any;
  name: string;

  setActiveFile: (file: File) => void;
  setName: (name: string) => void;
  setStack: (stack: any) => void;

  createFile: (file: File) => void;
  deleteFile: (file: File) => void;
  renameFile: (file: File, newName: string) => void;
  removeFile: (file: File) => void;
  moveFile: (from: string, to: string) => void;
  copyFile: (file: File) => void;

  resetProject: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  files: {},
  activeFile: null,
  stack: {},
  name: "My Project",

  setActiveFile: (file) => set({ activeFile: file }),
  setName: (name) => set({ name }),
  setStack: (stack) => set({ stack }),

  createFile: (file) =>
    set((state) => ({ files: { ...state.files, [file.name]: file } })),
  deleteFile: (file) =>
    set((state) => {
      const { [file.name]: _, ...rest } = state.files;
      return { files: rest };
    }),
  renameFile: (file, newName) =>
    set((state) => {
      const newFiles = { ...state.files };
      newFiles[newName] = { ...file, name: newName };
      delete newFiles[file.name];
      return { files: newFiles };
    }),
  removeFile: (file) =>
    set((state) => {
      const { [file.name]: _, ...rest } = state.files;
      return { files: rest };
    }),
  moveFile: (from, to) =>
    set((state) => {
      const file = state.files[from];
      if (!file) return {};
      const newFiles = { ...state.files, [to]: { ...file, name: to } };
      delete newFiles[from];
      return { files: newFiles };
    }),
  copyFile: (file) =>
    set((state) => ({
      files: { ...state.files, [`copy-${file.name}`]: { ...file } },
    })),
  resetProject: () =>
    set({
      files: {},
      activeFile: null,
      stack: {},
      name: "My Project",
    }),
}));
