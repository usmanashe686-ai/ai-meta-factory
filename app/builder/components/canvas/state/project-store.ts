import { create } from 'zustand';
import { Template } from '../templates/TemplateLibrary';
import { FileNode } from '../types/project.types';
import { arrayMove } from '@dnd-kit/sortable';

export interface ConsoleEntry {
  type: 'command' | 'ai' | 'error' | 'info' | 'success'; // Added success for compatibility
  message: string;
  timestamp?: Date;
}

interface ProjectState {
  project: { id: string; name: string } | null;
  files: FileNode[];
  openFiles: string[]; // This matches your FileTabs.tsx
  openFileIds: string[]; // This satisfies components looking for IDs
  activeFileId: string | null;
  isSaving: boolean;
  console: ConsoleEntry[];
  consoleEntries: ConsoleEntry[]; // Alias for compatibility
  envVars: Record<string, string>;

  createProjectFromTemplate: (template: Template) => Promise<string>;
  createBlankProject: (name?: string) => void;
  saveProject: () => Promise<void>;
  createFile: (path: string, content: string, isFolder?: boolean) => void;
  updateFileContent: (fileId: string, content: string) => void;
  deleteFile: (fileId: string) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFileId: (id: string | null) => void;
  setActiveFile: (id: string | null) => void;
  addToConsole: (entry: Omit<ConsoleEntry, 'timestamp'>) => void;
  clearConsole: () => void;
  saveCurrentFile: () => Promise<void>;
  formatCurrentFile: () => Promise<void>;
  runPreview: () => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => void;
  copyFile: (path: string) => void;
  searchFiles: (query: string) => Array<{ path: string; name: string }>;
  moveFile: (sourceId: string, targetId: string) => void;
  setProjectName: (name: string) => void;
  setFiles: (newFiles: FileNode[]) => void;
  setEnvVar: (key: string, value: string) => void;
  removeEnvVar: (key: string) => void;
  getEnvVars: () => Record<string, string>;
}

// Helper functions for recursive tree operations
const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const updateNodeContent = (nodes: FileNode[], id: string, content: string): FileNode[] => {
  return nodes.map(node => {
    if (node.id === id) return { ...node, content };
    if (node.children) return { ...node, children: updateNodeContent(node.children, id, content) };
    return node;
  });
};

const deleteNode = (nodes: FileNode[], id: string): FileNode[] => {
  return nodes.filter(node => {
    if (node.id === id) return false;
    if (node.children) {
      node.children = deleteNode(node.children, id);
    }
    return true;
  });
};

const renameNode = (nodes: FileNode[], oldId: string, newId: string, newName: string): FileNode[] => {
  return nodes.map(node => {
    if (node.id === oldId) return { ...node, id: newId, name: newName, path: newId };
    if (node.children) return { ...node, children: renameNode(node.children, oldId, newId, newName) };
    return node;
  });
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  files: [],
  openFiles: [],
  openFileIds: [], // Keep in sync with openFiles
  activeFileId: null,
  isSaving: false,
  console: [],
  consoleEntries: [], // Alias
  envVars: {},

  createProjectFromTemplate: async (template) => {
    const projectId = 'proj-' + Date.now();
    const files: FileNode[] = Object.entries(template.files).map(([path, content]) => ({
      id: path,
      name: path.split('/').pop() || path,
      type: 'file',
      path,
      content,
    }));
    const newProject = { id: projectId, name: template.name };
    set({ project: newProject, files, envVars: {} });
    return projectId;
  },

  createBlankProject: (name = 'Untitled Project') => {
    const projectId = 'proj-' + Date.now();
    const defaultFile: FileNode = {
      id: 'src/App.tsx',
      name: 'App.tsx',
      type: 'file',
      path: 'src/App.tsx',
      content: `export default function App() {\n  return <div>Hello AI Meta Factory</div>\n}`,
    };
    set({
      project: { id: projectId, name },
      files: [defaultFile],
      openFiles: ['src/App.tsx'],
      openFileIds: ['src/App.tsx'],
      activeFileId: 'src/App.tsx',
      envVars: {},
    });
  },

  saveProject: async () => {
    set({ isSaving: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isSaving: false });
  },

  createFile: (path, content, isFolder = false) => {
    const { files } = get();
    const newFile: FileNode = {
      id: path,
      name: path.split('/').pop() || path,
      type: isFolder ? 'folder' : 'file',
      path,
      content: isFolder ? undefined : content,
      children: isFolder ? [] : undefined,
    };
    set({ files: [...files, newFile] });
  },

  updateFileContent: (fileId, content) => {
    const { files } = get();
    set({ files: updateNodeContent(files, fileId, content) });
  },

  deleteFile: (fileId) => {
    const { files, activeFileId, openFiles } = get();
    const newFiles = deleteNode(files, fileId);
    const newOpenFiles = openFiles.filter(id => id !== fileId);
    const newActive = activeFileId === fileId ? null : activeFileId;
    set({ files: newFiles, openFiles: newOpenFiles, openFileIds: newOpenFiles, activeFileId: newActive });
  },

  openFile: (fileId) => {
    const { openFiles, activeFileId, files } = get();
    const file = findNodeById(files, fileId);
    if (!file || file.type === 'folder') return;

    if (!openFiles.includes(fileId)) {
      set({ openFiles: [...openFiles, fileId], openFileIds: [...openFiles, fileId] });
    }
    set({ activeFileId: fileId });
  },

  closeFile: (fileId) => {
    const { openFiles, activeFileId } = get();
    const newOpenFiles = openFiles.filter(id => id !== fileId);
    let newActive = activeFileId;
    if (activeFileId === fileId) {
      newActive = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;
    }
    set({ openFiles: newOpenFiles, openFileIds: newOpenFiles, activeFileId: newActive });
  },

  setActiveFileId: (id) => set({ activeFileId: id }),
  setActiveFile: (id) => set({ activeFileId: id }),

  addToConsole: (entry) => {
    const { console } = get();
    const newEntry = { ...entry, timestamp: new Date() };
    set({ 
        console: [...console, newEntry],
        consoleEntries: [...console, newEntry]
    });
  },

  clearConsole: () => set({ console: [], consoleEntries: [] }),

  saveCurrentFile: async () => { console.log('Saved'); },
  formatCurrentFile: async () => { console.log('Formatted'); },
  runPreview: async () => { console.log('Preview running'); },

  renameFile: (oldPath, newPath) => {
    const { files } = get();
    const newName = newPath.split('/').pop() || newPath;
    set({ files: renameNode(files, oldPath, newPath, newName) });
  },

  copyFile: (path) => {
    const { files } = get();
    const node = findNodeById(files, path);
    if (node && node.type === 'file') {
      const newPath = path.replace(/(\.[^/.]+$|$)/, '-copy$1');
      const newFile: FileNode = { ...node, id: newPath, name: newPath.split('/').pop() || newPath, path: newPath };
      set({ files: [...files, newFile] });
    }
  },

  searchFiles: (query) => {
    const { files } = get();
    const results: { path: string; name: string }[] = [];
    const search = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.type === 'file' && node.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({ path: node.id, name: node.name });
        }
        if (node.children) search(node.children);
      }
    };
    search(files);
    return results;
  },

  moveFile: (sourceId, targetId) => {
    const { files } = get();
    const sourceIndex = files.findIndex(f => f.id === sourceId);
    const targetIndex = files.findIndex(f => f.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    set({ files: arrayMove(files, sourceIndex, targetIndex) });
  },

  setProjectName: (name) => {
    const { project } = get();
    if (project) set({ project: { ...project, name } });
  },

  setFiles: (newFiles) => set({ files: newFiles }),
  setEnvVar: (key, value) => set((state) => ({ envVars: { ...state.envVars, [key]: value } })),
  removeEnvVar: (key) => set((state) => {
    const next = { ...state.envVars };
    delete next[key];
    return { envVars: next };
  }),
  getEnvVars: () => get().envVars,
}));
