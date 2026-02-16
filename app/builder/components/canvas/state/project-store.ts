import { create } from 'zustand';
import { Template } from '../templates/TemplateLibrary';
import { FileNode } from '../types/project.types';

export interface ConsoleEntry {
  type: 'command' | 'ai' | 'error' | 'info';
  message: string;
  timestamp?: Date;
}

interface ProjectState {
  project: { id: string; name: string } | null;
  files: FileNode[];
  activeFileId: string | null;
  isSaving: boolean;
  console: ConsoleEntry[];
  createProjectFromTemplate: (template: Template) => Promise<string>;
  saveProject: () => Promise<void>;
  createFile: (path: string, content: string, isFolder?: boolean) => void;
  updateFileContent: (fileId: string, content: string) => void;
  deleteFile: (fileId: string) => void;
  setActiveFileId: (id: string | null) => void;
  addToConsole: (entry: Omit<ConsoleEntry, 'timestamp'>) => void;
  clearConsole: () => void;
}

// Helper to find a node by ID recursively
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

// Helper to update a node's content by ID (immutably)
const updateNodeContent = (nodes: FileNode[], id: string, content: string): FileNode[] => {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, content };
    }
    if (node.children) {
      return { ...node, children: updateNodeContent(node.children, id, content) };
    }
    return node;
  });
};

// Helper to delete a node by ID
const deleteNode = (nodes: FileNode[], id: string): FileNode[] => {
  return nodes.filter(node => {
    if (node.id === id) return false;
    if (node.children) {
      node.children = deleteNode(node.children, id);
    }
    return true;
  });
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  files: [],
  activeFileId: null,
  isSaving: false,
  console: [],
  createProjectFromTemplate: async (template) => {
    const projectId = 'proj-' + Date.now();
    // Convert template files to FileNode array (flat for now)
    const files: FileNode[] = Object.entries(template.files).map(([path, content]) => ({
      id: path, // Use path as ID (could be improved)
      name: path.split('/').pop() || path,
      type: 'file',
      path,
      content,
    }));
    const newProject = { id: projectId, name: template.name };
    set({ project: newProject, files });
    return projectId;
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
    const { files, activeFileId } = get();
    const newFiles = deleteNode(files, fileId);
    // If the active file was deleted, set activeFileId to null
    const newActive = activeFileId === fileId ? null : activeFileId;
    set({ files: newFiles, activeFileId: newActive });
  },
  setActiveFileId: (id) => set({ activeFileId: id }),
  addToConsole: (entry) => {
    const { console } = get();
    set({
      console: [...console, { ...entry, timestamp: new Date() }]
    });
  },
  clearConsole: () => {
    set({ console: [] });
  },
}));
