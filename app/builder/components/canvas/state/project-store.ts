'use client';

import { create } from 'zustand';

type File = { content: string; language?: string };
type ProjectStore = {
  files: Record<string, File>;
  activeFile: string;
  stack: string;
  createFile: (path: string, content: string) => void;
  updateFileContent: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  setActiveFile: (path: string) => void;
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  files: {},
  activeFile: '',
  stack: 'react',
  createFile: (path, content) =>
    set((state) => ({
      files: { ...state.files, [path]: { content } },
      activeFile: path,
    })),
  updateFileContent: (path, content) =>
    set((state) => ({
      files: { ...state.files, [path]: { ...state.files[path], content } },
    })),
  deleteFile: (path) => {
    const newFiles = { ...get().files };
    delete newFiles[path];
    set({ files: newFiles, activeFile: Object.keys(newFiles)[0] || '' });
  },
  renameFile: (oldPath, newPath) => {
    const newFiles = { ...get().files };
    newFiles[newPath] = newFiles[oldPath];
    delete newFiles[oldPath];
    set({ files: newFiles, activeFile: newPath });
  },
  setActiveFile: (path) => set({ activeFile: path }),
}));

moveFile: (from: number, to: number) => set((state) => {
  const keys = Object.keys(state.files);
  const temp = keys[from];
  keys.splice(from, 1);
  keys.splice(to, 0, temp);

  const newFiles: Record<string, any> = {};
  keys.forEach(k => { newFiles[k] = state.files[k]; });
  return { files: newFiles };
}),
