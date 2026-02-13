import { create } from 'zustand';
import { FileNode } from '../types/project.types';
import { apiClient } from '../../utils/apiClient'; // adjust path as needed

interface ProjectState {
  // Project metadata
  projectId: string | null;
  setProjectId: (id: string) => void;

  // File tree
  files: FileNode[];
  setFiles: (files: FileNode[]) => void;
  addFile: (parentPath: string, file: FileNode) => void;
  updateFileContent: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  moveFile: (sourceId: string, targetId: string) => void;

  // Open tabs / active file
  openFiles: FileNode[];          // files currently opened in tabs
  activeFileId: string | null;
  setActiveFile: (fileId: string | null) => void;
  closeFile: (fileId: string) => void;

  // Actions that call backend
  saveCurrentFile: () => Promise<void>;
  formatCurrentFile: () => Promise<void>;
  runPreview: () => void;          // triggers preview update
}

// Helper: find node by ID
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

// Helper: update node in tree
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

// Helper: remove node from tree
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

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Project ID
  projectId: null,
  setProjectId: (id) => set({ projectId: id }),

  // File tree
  files: [],
  setFiles: (files) => set({ files }),

  addFile: (parentPath, file) => set((state) => {
    const parentId = parentPath; // simplified: assume parentPath is the node's ID
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
    // If target is a file, we could insert as sibling – not implemented for simplicity
    return state;
  }),

  // Open tabs / active file
  openFiles: [],
  activeFileId: null,

  setActiveFile: (fileId) => set((state) => {
    if (!fileId) return { activeFileId: null };
    const file = findNode(state.files, fileId);
    if (!file) return state;
    // Add to openFiles if not already present
    const isOpen = state.openFiles.some(f => f.id === fileId);
    const newOpenFiles = isOpen ? state.openFiles : [...state.openFiles, file];
    return {
      activeFileId: fileId,
      openFiles: newOpenFiles,
    };
  }),

  closeFile: (fileId) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f.id !== fileId);
    const newActiveId = state.activeFileId === fileId
      ? (newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1].id : null)
      : state.activeFileId;
    return {
      openFiles: newOpenFiles,
      activeFileId: newActiveId,
    };
  }),

  // Backend actions
  saveCurrentFile: async () => {
    const { activeFileId, files, projectId } = get();
    if (!activeFileId || !projectId) return;
    const file = findNode(files, activeFileId);
    if (!file || file.type === 'folder') return;
    try {
      await apiClient.post(`/projects/${projectId}/files/${encodeURIComponent(file.path)}`, {
        content: file.content,
      });
      // Optionally show a success message
    } catch (error) {
      console.error('Save failed:', error);
      // Optionally show error toast
    }
  },

  formatCurrentFile: async () => {
    const { activeFileId, files, updateFileContent } = get();
    if (!activeFileId) return;
    const file = findNode(files, activeFileId);
    if (!file || file.type === 'folder') return;
    // Simple formatting: just a placeholder – you could integrate prettier later
    // For now, just trim whitespace
    const formatted = file.content?.trim() || '';
    updateFileContent(file.path, formatted);
    // Also trigger save after format? Maybe optionally.
  },

  runPreview: () => {
    // This could update a preview store or emit an event
    console.log('Preview requested');
    // In a real app, you might use an event bus or another store
  },
}));
