import { create } from 'zustand';
import { Template } from '../templates/TemplateLibrary';
import { FileNode } from '../types/project.types';
import { arrayMove } from '@dnd-kit/sortable';

export interface ConsoleEntry {
  type: 'command' | 'ai' | 'error' | 'info';
  message: string;
  timestamp?: Date;
}

interface ProjectState {
  project: { id: string; name: string } | null;
  files: FileNode[];
  openFiles: string[];
  activeFileId: string | null;
  isSaving: boolean;
  console: ConsoleEntry[];
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

// Helper to rename a node
const renameNode = (nodes: FileNode[], oldId: string, newId: string, newName: string): FileNode[] => {
  return nodes.map(node => {
    if (node.id === oldId) {
      return { ...node, id: newId, name: newName, path: newId };
    }
    if (node.children) {
      return { ...node, children: renameNode(node.children, oldId, newId, newName) };
    }
    return node;
  });
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  files: [],
  openFiles: [],
  activeFileId: null,
  isSaving: false,
  console: [],
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
    set({ project: newProject, files });
    return projectId;
  },
  createBlankProject: (name = 'Untitled Project') => {
    const projectId = 'proj-' + Date.now();
    // Create a default App.tsx file so preview has something to show
    const defaultFile: FileNode = {
      id: 'src/App.tsx',
      name: 'App.tsx',
      type: 'file',
      path: 'src/App.tsx',
      content: `export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Hello, AI Meta Factory!</h1>
      <p className="mt-4 text-gray-400">Start coding your project.</p>
    </div>
  );
}`,
    };
    set({
      project: { id: projectId, name },
      files: [defaultFile],
      openFiles: [],
      activeFileId: null,
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
    set({ files: newFiles, openFiles: newOpenFiles, activeFileId: newActive });
  },
  openFile: (fileId) => {
    const { openFiles, activeFileId, files } = get();
    const file = findNodeById(files, fileId);
    if (!file || file.type === 'folder') return;

    if (!openFiles.includes(fileId)) {
      set({ openFiles: [...openFiles, fileId] });
    }
    if (activeFileId !== fileId) {
      set({ activeFileId: fileId });
    }
  },
  closeFile: (fileId) => {
    const { openFiles, activeFileId } = get();
    const newOpenFiles = openFiles.filter(id => id !== fileId);
    let newActive = activeFileId;
    if (activeFileId === fileId) {
      newActive = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;
    }
    set({ openFiles: newOpenFiles, activeFileId: newActive });
  },
  setActiveFileId: (id) => set({ activeFileId: id }),
  setActiveFile: (id) => set({ activeFileId: id }),
  addToConsole: (entry) => {
    const { console } = get();
    set({
      console: [...console, { ...entry, timestamp: new Date() }]
    });
  },
  clearConsole: () => {
    set({ console: [] });
  },
  saveCurrentFile: async () => {
    console.log('saveCurrentFile called');
  },
  formatCurrentFile: async () => {
    console.log('formatCurrentFile called');
  },
  runPreview: async () => {
    console.log('runPreview called');
  },
  renameFile: (oldPath, newPath) => {
    const { files } = get();
    const newName = newPath.split('/').pop() || newPath;
    set({ files: renameNode(files, oldPath, newPath, newName) });
  },
  copyFile: (path) => {
    const { files } = get();
    const node = findNodeById(files, path);
    if (node && node.type === 'file') {
      const base = path.replace(/\.[^/.]+$/, '');
      const ext = path.includes('.') ? path.substring(path.lastIndexOf('.')) : '';
      let newPath = base + '-copy' + ext;
      let counter = 1;
      while (findNodeById(files, newPath)) {
        newPath = base + '-copy' + (++counter) + ext;
      }
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
    const newFiles = arrayMove(files, sourceIndex, targetIndex);
    set({ files: newFiles });
  },
  setProjectName: (name) => {
    const { project } = get();
    if (project) {
      set({ project: { ...project, name } });
    } else {
      console.warn('No project to rename');
    }
  },
}));
