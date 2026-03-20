import { create } from 'zustand';
import { FileNode } from '../types/project.types';

interface ProjectState {
  project: { id: string; name: string } | null;
  files: FileNode[];
  openFiles: string[];
  activeFileId: string | null;
  createBlankProject: (name?: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFileId: (id: string | null) => void;
}

const updateNodeContent = (nodes: FileNode[], id: string, content: string): FileNode[] => {
  return nodes.map(node => {
    if (node.id === id) return { ...node, content };
    if (node.children) return { ...node, children: updateNodeContent(node.children, id, content) };
    return node;
  });
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  files: [],
  openFiles: [],
  activeFileId: null,

  createBlankProject: (name = 'My First AI Project') => {
    const defaultFile: FileNode = {
      id: 'src/App.tsx',
      name: 'App.tsx',
      type: 'file',
      path: 'src/App.tsx',
      content: 'export default function App() {\n  return <h1>Hello AI Meta Factory!</h1>;\n}',
    };
    set({
      project: { id: 'p1', name },
      files: [defaultFile],
      openFiles: ['src/App.tsx'],
      activeFileId: 'src/App.tsx',
    });
  },

  updateFileContent: (fileId, content) => {
    set({ files: updateNodeContent(get().files, fileId, content) });
  },

  openFile: (fileId) => {
    const { openFiles } = get();
    if (!openFiles.includes(fileId)) {
      set({ openFiles: [...openFiles, fileId] });
    }
    set({ activeFileId: fileId });
  },

  closeFile: (fileId) => {
    const { openFiles, activeFileId } = get();
    
    // Safety check: ensure openFiles is actually an array
    const currentOpenFiles = openFiles || [];
    const newOpenFiles = currentOpenFiles.filter(id => id !== fileId);
    
    let newActiveId = activeFileId;
    if (activeFileId === fileId) {
      // ✅ FIX: Use length check + safe indexing to prevent 'undefined' crash
      newActiveId = newOpenFiles.length > 0 
        ? newOpenFiles[newOpenFiles.length - 1] 
        : null;
    }

    set({ 
      openFiles: newOpenFiles, 
      activeFileId: newActiveId 
    });
  },

  setActiveFileId: (id) => set({ activeFileId: id }),
}));
