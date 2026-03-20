import { create } from 'zustand';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
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
  activeFileId: string | null;
  consoleEntries: ConsoleEntry[];
  project: { name: string } | null;
  // Actions
  openFile: (id: string) => void;
  closeFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  addToConsole: (entry: { type: 'command' | 'ai' | 'error' | 'success', message: string }) => void;
  createBlankProject: (name: string) => void;
}

// Recursive helper to update nested file content
const updateNodeContent = (nodes: FileNode[], id: string, content: string): FileNode[] => {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, content };
    }
    if (node.children) {
      return { ...node, children: updateNodeContent(node.children, id, content) };
    }
    return node;
  });
};

export const useProjectStore = create<ProjectState>((set) => ({
  files: [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      children: [
        { id: 'src/App.tsx', name: 'App.tsx', type: 'file', content: '// Start building your AI app!' },
      ],
    },
  ],
  activeFileId: 'src/App.tsx',
  consoleEntries: [],
  project: null,

  openFile: (id) => set({ activeFileId: id }),
  
  closeFile: (id) => set((state) => ({
    files: state.files.filter(f => f.id !== id),
    activeFileId: state.activeFileId === id ? null : state.activeFileId
  })),

  updateFileContent: (id, content) => set((state) => ({
    files: updateNodeContent(state.files, id, content)
  })),

  addToConsole: (entry) => set((state) => ({
    consoleEntries: [...state.consoleEntries, { ...entry, timestamp: new Date() }]
  })),

  createBlankProject: (name) => set({ project: { name } }),
}));
