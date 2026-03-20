import { create } from 'zustand';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string; 
  content?: string;
  children?: FileNode[];
}

interface ConsoleEntry {
  type: 'command' | 'ai' | 'error' | 'success';
  message: string;
  timestamp: Date;
}

interface ProjectState {
  files: FileNode[];
  openFileIds: string[]; // Track multiple open tabs
  activeFileId: string | null;
  consoleEntries: ConsoleEntry[];
  project: { name: string } | null;
  // Actions
  openFile: (id: string) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  addToConsole: (entry: { type: 'command' | 'ai' | 'error' | 'success', message: string }) => void;
  createBlankProject: (name: string) => void;
}

const updateNodeContent = (nodes: FileNode[], id: string, content: string): FileNode[] => {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, content };
    if (node.children) return { ...node, children: updateNodeContent(node.children, id, content) };
    return node;
  });
};

export const useProjectStore = create<ProjectState>((set) => ({
  files: [
    {
      id: 'src', name: 'src', type: 'folder', path: '/src',
      children: [
        { id: 'src/App.tsx', name: 'App.tsx', type: 'file', path: '/src/App.tsx', content: '// AI Meta Factory Ready' },
      ],
    },
  ],
  openFileIds: ['src/App.tsx'],
  activeFileId: 'src/App.tsx',
  consoleEntries: [],
  project: null,

  openFile: (id) => set((state) => ({
    openFileIds: state.openFileIds.includes(id) ? state.openFileIds : [...state.openFileIds, id],
    activeFileId: id
  })),

  setActiveFile: (id) => set({ activeFileId: id }),
  
  closeFile: (id) => set((state) => {
    const newOpenFiles = state.openFileIds.filter(fid => fid !== id);
    return {
      openFileIds: newOpenFiles,
      activeFileId: state.activeFileId === id ? (newOpenFiles[0] || null) : state.activeFileId
    };
  }),

  updateFileContent: (id, content) => set((state) => ({
    files: updateNodeContent(state.files, id, content)
  })),

  addToConsole: (entry) => set((state) => ({
    consoleEntries: [...state.consoleEntries, { ...entry, timestamp: new Date() }]
  })),

  createBlankProject: (name) => set({ project: { name } }),
}));
