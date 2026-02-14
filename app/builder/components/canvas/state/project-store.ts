import { create } from 'zustand';
import { FileNode } from '../types/project.types';
import apiClient from '../utils/apiClient';

const findNode = (nodes: FileNode[], id: string): FileNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const updateNode = (
  nodes: FileNode[],
  id: string,
  updater: (node: FileNode) => FileNode
): FileNode[] => {
  return nodes.map(node => {
    if (node.id === id) return updater(node);
    if (node.children) {
      return { ...node, children: updateNode(node.children, id, updater) };
    }
    return node;
  });
};

const removeNode = (nodes: FileNode[], id: string): FileNode[] => {
  return nodes.reduce((acc, node) => {
    if (node.id === id) return acc;
    if (node.children) {
      acc.push({ ...node, children: removeNode(node.children, id) });
    } else {
      acc.push(node);
    }
    return acc;
  }, [] as FileNode[]);
};

const generateId = () => Math.random().toString(36).substr(2, 9);

interface ProjectState {
  projectId: string | null;
  setProjectId: (id: string) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  files: FileNode[];
  setFiles: (files: FileNode[]) => void;
  addFile: (parentPath: string, file: FileNode) => void;
  updateFileContent: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  moveFile: (sourceId: string, targetId: string) => void;
  createFile: (path: string, content: string, language?: string) => void;
  updateFile: (path: string, content: string) => void;
  removeFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  copyFile: (sourcePath: string, destPath: string) => void;
  searchFiles: (query: string) => FileNode[];
  openFiles: FileNode[];
  activeFileId: string | null;
  setActiveFile: (fileId: string | null) => void;
  closeFile: (fileId: string) => void;
  consoleOutput: Array<{ type: string; message: string; timestamp: number }>;
  addToConsole: (entry: { type: string; message: string }) => void;
  clearConsole: () => void;
  consoleHistory: string[];
  addToConsoleHistory: (command: string) => void;
  isConsoleRunning: boolean;
  setConsoleRunning: (running: boolean) => void;
  stack: any;
  currentProject: any;
  saveCurrentFile: () => Promise<void>;
  formatCurrentFile: () => Promise<void>;
  runPreview: () => void;
  saveProject: () => Promise<void>;
  exportProject: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectId: null,
  setProjectId: (id) => set({ projectId: id }),
  projectName: 'Untitled Project',
  setProjectName: (name) => set({ projectName: name }),
  files: [],
  setFiles: (files) => set({ files }),
  addFile: (parentPath, file) => set((state) => {
    const parentId = parentPath;
    const newFiles = updateNode(state.files, parentId, (parent) => ({
      ...parent,
      children: [...(parent.children || []), file],
    }));
    return { files: newFiles };
  }),
  updateFileContent: (path, content) => set((state) => {
    const newFiles = updateNode(state.files, path, (node) => ({
      ...node,
      content,
    }));
    return { files: newFiles };
  }),
  deleteFile: (path) => set((state) => ({
    files: removeNode(state.files, path),
  })),
  moveFile: (sourceId, targetId) => set((state) => {
    const sourceNode = findNode(state.files, sourceId);
    if (!sourceNode) return state;
    const withoutSource = removeNode(state.files, sourceId);
    const targetNode = findNode(withoutSource, targetId);
    if (!targetNode) return state;
    if (targetNode.type === 'folder') {
      const newFiles = updateNode(withoutSource, targetId, (folder) => ({
        ...folder,
        children: [...(folder.children || []), sourceNode],
      }));
      return { files: newFiles };
    }
    return state;
  }),
  createFile: (path, content, language) => {
    const newFile: FileNode = {
      id: generateId(),
      name: path.split('/').pop() || 'file',
      type: 'file',
      path,
      content,
    };
    const parentPath = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';
    get().addFile(parentPath, newFile);
  },
  updateFile: (path, content) => get().updateFileContent(path, content),
  removeFile: (path) => get().deleteFile(path),
  renameFile: (oldPath, newPath) => console.log('renameFile stub', oldPath, newPath),
  copyFile: (sourcePath, destPath) => console.log('copyFile stub', sourcePath, destPath),
  searchFiles: (query) => {
    const allFiles: FileNode[] = [];
    const collect = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'file') allFiles.push(node);
        if (node.children) collect(node.children);
      });
    };
    collect(get().files);
    return allFiles.filter(f => f.name.includes(query));
  },
  openFiles: [],
  activeFileId: null,
  setActiveFile: (fileId) => set((state) => {
    if (!fileId) return { activeFileId: null };
    const file = findNode(state.files, fileId);
    if (!file) return state;
    const isOpen = state.openFiles.some(f => f.id === fileId);
    const newOpenFiles = isOpen ? state.openFiles : [...state.openFiles, file];
    return { activeFileId: fileId, openFiles: newOpenFiles };
  }),
  closeFile: (fileId) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f.id !== fileId);
    const newActiveId = state.activeFileId === fileId
      ? (newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1].id : null)
      : state.activeFileId;
    return { openFiles: newOpenFiles, activeFileId: newActiveId };
  }),
  consoleOutput: [],
  addToConsole: (entry) => set((state) => ({
    consoleOutput: [...state.consoleOutput, { ...entry, timestamp: Date.now() }]
  })),
  clearConsole: () => set({ consoleOutput: [] }),
  consoleHistory: [],
  addToConsoleHistory: (command) => set((state) => ({
    consoleHistory: [...state.consoleHistory, command]
  })),
  isConsoleRunning: false,
  setConsoleRunning: (running) => set({ isConsoleRunning: running }),
  stack: { frontend: 'react', backend: 'node', database: 'none', gitProvider: 'github' },
  currentProject: {},
  saveCurrentFile: async () => {
    const { activeFileId, files, projectId } = get();
    if (!activeFileId || !projectId) return;
    const file = findNode(files, activeFileId);
    if (!file || file.type === 'folder') return;
    try {
      await apiClient.post(`/projects/${projectId}/files/${encodeURIComponent(file.path)}`, {
        content: file.content,
      });
    } catch (error) {
      console.error('Save failed:', error);
    }
  },
  formatCurrentFile: async () => {
    const { activeFileId, files, updateFileContent } = get();
    if (!activeFileId) return;
    const file = findNode(files, activeFileId);
    if (!file || file.type === 'folder') return;
    const formatted = file.content?.trim() || '';
    updateFileContent(file.path, formatted);
  },
  runPreview: () => console.log('Preview requested'),
  saveProject: async () => console.log('saveProject stub'),
  exportProject: async () => console.log('exportProject stub'),
}));
