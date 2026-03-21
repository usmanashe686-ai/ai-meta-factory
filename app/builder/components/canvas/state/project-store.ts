import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

// ---------------- HELPERS ----------------
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

const updateNodeContent = (nodes: FileNode[], id: string, content: string): FileNode[] =>
  nodes.map(node => {
    if (node.id === id) return { ...node, content };
    if (node.children) return { ...node, children: updateNodeContent(node.children, id, content) };
    return node;
  });

const deleteNode = (nodes: FileNode[], id: string): FileNode[] =>
  nodes.filter(node => {
    if (node.id === id) return false;
    if (node.children) node.children = deleteNode(node.children, id);
    return true;
  });

const renameNode = (nodes: FileNode[], oldId: string, newId: string, newName: string): FileNode[] =>
  nodes.map(node => {
    if (node.id === oldId) return { ...node, id: newId, name: newName, path: newId };
    if (node.children) return { ...node, children: renameNode(node.children, oldId, newId, newName) };
    return node;
  });

// ---------------- STORE ----------------
export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      project: null,
      files: [],
      openFiles: [],
      activeFileId: null,
      isSaving: false,
      console: [],
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
        set({ project: { id: projectId, name: template.name }, files, envVars: {} });
        return projectId;
      },

      createBlankProject: (name = 'Untitled Project') => {
        const defaultFile: FileNode = {
          id: 'src/App.tsx',
          name: 'App.tsx',
          type: 'file',
          path: 'src/App.tsx',
          content: `export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Hello, AI Meta Factory!</h1>
    </div>
  );
}`,
        };

        set({
          project: { id: 'proj-' + Date.now(), name },
          files: [defaultFile],
          openFiles: ['src/App.tsx'],
          activeFileId: 'src/App.tsx',
        });
      },

      saveProject: async () => {
        set({ isSaving: true });
        await new Promise(r => setTimeout(r, 500));
        set({ isSaving: false });
      },

      createFile: (path, content, isFolder = false) => {
        const newFile: FileNode = {
          id: path,
          name: path.split('/').pop() || path,
          type: isFolder ? 'folder' : 'file',
          path,
          content: isFolder ? undefined : content,
          children: isFolder ? [] : undefined,
        };
        set(state => ({ files: [...state.files, newFile] }));
      },

      updateFileContent: (fileId, content) =>
        set(state => ({ files: updateNodeContent(state.files, fileId, content) })),

      deleteFile: (fileId) => {
        const { files, openFiles, activeFileId } = get();
        const newOpen = openFiles.filter(id => id !== fileId);
        set({
          files: deleteNode(files, fileId),
          openFiles: newOpen,
          activeFileId: activeFileId === fileId ? newOpen[0] || null : activeFileId,
        });
      },

      openFile: (fileId) =>
        set(state => ({
          openFiles: state.openFiles.includes(fileId) ? state.openFiles : [...state.openFiles, fileId],
          activeFileId: fileId,
        })),

      closeFile: (fileId) =>
        set(state => {
          const remaining = state.openFiles.filter(id => id !== fileId);
          return {
            openFiles: remaining,
            activeFileId: state.activeFileId === fileId
              ? (remaining[remaining.length - 1] || null)
              : state.activeFileId,
          };
        }),

      setActiveFileId: (id) => set({ activeFileId: id }),
      setActiveFile: (id) => set({ activeFileId: id }),

      addToConsole: (entry) =>
        set(state => ({
          console: [...state.console, { ...entry, timestamp: new Date() }]
        })),

      clearConsole: () => set({ console: [] }),

      saveCurrentFile: async () => {},
      formatCurrentFile: async () => {},
      runPreview: async () => {},

      renameFile: (oldPath, newPath) =>
        set(state => ({
          files: renameNode(state.files, oldPath, newPath, newPath.split('/').pop() || newPath)
        })),

      copyFile: () => {},

      searchFiles: () => [],

      moveFile: (sourceId, targetId) => {
        const files = get().files;
        const from = files.findIndex(f => f.id === sourceId);
        const to = files.findIndex(f => f.id === targetId);
        if (from === -1 || to === -1) return;
        set({ files: arrayMove(files, from, to) });
      },

      setProjectName: (name) => {
        const project = get().project;
        if (project) set({ project: { ...project, name } });
      },

      setFiles: (newFiles) => set({ files: newFiles }),

      setEnvVar: (key, value) =>
        set(state => ({ envVars: { ...state.envVars, [key]: value } })),

      removeEnvVar: (key) =>
        set(state => {
          const copy = { ...state.envVars };
          delete copy[key];
          return { envVars: copy };
        }),

      getEnvVars: () => get().envVars,
    }),
    {
      name: 'project-storage-v2',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
