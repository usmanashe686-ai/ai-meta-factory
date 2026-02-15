import { create } from 'zustand';
import { FileNode } from '../types/project.types';
import apiClient from '../utils/apiClient';
import { v4 as uuidv4 } from 'uuid';

// Template interface (can be moved to types later)
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  files: Record<string, string>; // flat file map
  stack?: string[];
}

// Helper functions (unchanged)
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

const findNodeByPath = (nodes: FileNode[], path: string): FileNode | null => {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNodeByPath(node.children, path);
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

// Convert flat file map to tree structure
const flatFilesToTree = (files: Record<string, string>): FileNode[] => {
  const root: FileNode[] = [];
  const pathMap: Record<string, FileNode> = {};

  // Sort paths to ensure folders are created before their contents
  const sortedPaths = Object.keys(files).sort();

  for (const path of sortedPaths) {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    const folderPath = parts.join('/');

    // Create file node
    const fileNode: FileNode = {
      id: generateId(),
      name: fileName,
      type: 'file',
      path: path,
      content: files[path],
    };
    pathMap[path] = fileNode;

    // Attach to parent folder
    if (folderPath) {
      if (!pathMap[folderPath]) {
        // Create folder node if it doesn't exist
        const folderNode: FileNode = {
          id: generateId(),
          name: parts[parts.length - 1] || 'root',
          type: 'folder',
          path: folderPath,
          children: [],
        };
        pathMap[folderPath] = folderNode;
        // Find parent of folder recursively
        const parentFolderPath = parts.slice(0, -1).join('/');
        if (parentFolderPath) {
          const parentFolder = pathMap[parentFolderPath];
          if (parentFolder && parentFolder.children) {
            parentFolder.children.push(folderNode);
          } else {
            // Should not happen if paths are sorted
            root.push(folderNode);
          }
        } else {
          root.push(folderNode);
        }
      }
      const folder = pathMap[folderPath];
      if (folder && folder.children) {
        folder.children.push(fileNode);
      }
    } else {
      root.push(fileNode);
    }
  }
  return root;
};

interface ProjectState {
  // Existing tree‑based state
  projectId: string | null;
  setProjectId: (id: string) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  files: FileNode[];                       // tree
  setFiles: (files: FileNode[]) => void;
  addFile: (parentPath: string, file: FileNode) => void;
  updateFileContent: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  moveFile: (sourceId: string, targetId: string) => void;
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

  // New flat API expected by EnhancedFileExplorerDnDContent
  activeFile: string | null;                 // path of active file
  setActiveFileByPath: (path: string) => void;
  createFile: (path: string, content: string, isFolder: boolean) => void;
  removeFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  copyFile: (sourcePath: string, destPath?: string) => void;
  searchFiles: (query: string) => Array<{ path: string; name: string }>;

  // NEW: Template methods
  createProjectFromTemplate: (template: Template) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // --- Original fields (unchanged) ---
  projectId: null,
  setProjectId: (id) => set({ projectId: id }),
  projectName: 'Untitled Project',
  setProjectName: (name) => set({ projectName: name }),

  files: [],
  setFiles: (files) => set({ files }),
  addFile: (parentPath, file) => set((state) => {
    const parentId = parentPath; // parentPath is assumed to be the parent node's id? We'll keep as is.
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

  // --- New flat API implementation ---
  get activeFile() {
    const { activeFileId, files } = get();
    if (!activeFileId) return null;
    const node = findNode(files, activeFileId);
    return node?.path || null;
  },

  setActiveFileByPath: (path: string) => {
    const { files } = get();
    const node = findNodeByPath(files, path);
    if (node) {
      get().setActiveFile(node.id);
    } else {
      console.warn(`No file found at path: ${path}`);
    }
  },

  createFile: (path: string, content: string, isFolder: boolean) => {
    const { files } = get();
    // For folders, the component sends a path ending with '.folder-marker'
    const actualPath = isFolder && path.endsWith('.folder-marker')
      ? path.replace(/\.folder-marker$/, '')
      : path;

    // Determine parent path
    const parentPath = actualPath.includes('/')
      ? actualPath.substring(0, actualPath.lastIndexOf('/'))
      : '';

    const newNode: FileNode = {
      id: generateId(),
      name: actualPath.split('/').pop() || 'untitled',
      type: isFolder ? 'folder' : 'file',
      path: actualPath,
      ...(isFolder ? { children: [] } : { content }),
    };

    // Find parent node by its path (assuming parent is a folder)
    const parentNode = findNodeByPath(files, parentPath);
    if (parentNode && parentNode.type === 'folder') {
      get().addFile(parentNode.id, newNode);
    } else {
      // No parent found – add at root (files array)
      set((state) => ({ files: [...state.files, newNode] }));
    }
  },

  removeFile: (path: string) => {
    const { files } = get();
    const node = findNodeByPath(files, path);
    if (node) {
      get().deleteFile(node.id);
    }
  },

  renameFile: (oldPath: string, newPath: string) => {
    const { files } = get();
    const node = findNodeByPath(files, oldPath);
    if (!node) return;

    const updatePathRecursively = (n: FileNode): FileNode => {
      const newName = newPath.split('/').pop() || n.name;
      const newFullPath = newPath; // for the node itself
      const updated: FileNode = {
        ...n,
        name: newName,
        path: newFullPath,
      };
      if (n.children) {
        // Update children paths as well
        updated.children = n.children.map(child => {
          const childOldPath = child.path;
          const childNewPath = childOldPath.replace(oldPath, newPath);
          return updatePathRecursively({ ...child, path: childNewPath });
        });
      }
      return updated;
    };

    const updatedNode = updatePathRecursively(node);
    // Replace the old node with the updated one
    const newFiles = updateNode(files, node.id, () => updatedNode);
    set({ files: newFiles });

    // If the renamed file was active, activeFileId remains correct (id unchanged)
  },

  copyFile: (sourcePath: string, destPath?: string) => {
    const { files } = get();
    const sourceNode = findNodeByPath(files, sourcePath);
    if (!sourceNode) return;

    const generateDestPath = (base: string, ext: string): string => {
      let candidate = `${base}-copy${ext}`;
      let counter = 1;
      while (findNodeByPath(files, candidate)) {
        candidate = `${base}-copy${counter}${ext}`;
        counter++;
      }
      return candidate;
    };

    let targetPath = destPath;
    if (!targetPath) {
      const base = sourcePath.replace(/\.[^/.]+$/, '');
      const ext = sourcePath.includes('.') ? sourcePath.slice(sourcePath.lastIndexOf('.')) : '';
      targetPath = generateDestPath(base, ext);
    }

    // Deep copy the node (including children)
    const copyNode = (node: FileNode, newPath: string): FileNode => {
      const newNode: FileNode = {
        ...node,
        id: generateId(),
        path: newPath,
        name: newPath.split('/').pop() || node.name,
      };
      if (node.children) {
        newNode.children = node.children.map(child => {
          const childNewPath = child.path.replace(sourcePath, newPath);
          return copyNode(child, childNewPath);
        });
      }
      return newNode;
    };

    const newNode = copyNode(sourceNode, targetPath);
    // Add to parent
    const parentPath = targetPath.includes('/') ? targetPath.substring(0, targetPath.lastIndexOf('/')) : '';
    const parentNode = findNodeByPath(files, parentPath);
    if (parentNode && parentNode.type === 'folder') {
      get().addFile(parentNode.id, newNode);
    } else {
      set((state) => ({ files: [...state.files, newNode] }));
    }
  },

  searchFiles: (query: string) => {
    const { files } = get();
    const lowerQuery = query.toLowerCase();
    const results: Array<{ path: string; name: string }> = [];

    const collect = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'file') {
          if (node.name.toLowerCase().includes(lowerQuery) || node.path.toLowerCase().includes(lowerQuery)) {
            results.push({ path: node.path, name: node.name });
          }
        }
        if (node.children) collect(node.children);
      });
    };
    collect(files);
    return results;
  },

  // NEW: Create project from template
  createProjectFromTemplate: (template: Template) => {
    // Generate a new project ID
    const newProjectId = uuidv4();
    const projectName = template.name + ' - ' + new Date().toLocaleDateString();

    // Convert flat files to tree
    const fileTree = flatFilesToTree(template.files);

    set({
      projectId: newProjectId,
      projectName: projectName,
      files: fileTree,
      openFiles: [],      // start with no open files
      activeFileId: null, // no active file initially
      consoleOutput: [],
      consoleHistory: [],
    });
  },
}));
