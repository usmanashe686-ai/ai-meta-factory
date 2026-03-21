import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileNode } from '../types/project.types';

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

  createBlankProject: (name?: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (id: string | null) => void;
  setFiles: (newFiles: FileNode[]) => void;
}

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

      createBlankProject: (name = 'Untitled Project') => {
        const projectId = 'proj-' + Date.now();
        const defaultFile: FileNode = {
          id: 'src/App.tsx',
          name: 'App.tsx',
          type: 'file',
          path: 'src/App.tsx',
          content: `export default function App() {\n  return (\n    <div className="p-8">\n      <h1 className="text-2xl font-bold">Hello, AI Meta Factory!</h1>\n    </div>\n  );\n}`,
        };
        set({
          project: { id: projectId, name },
          files: [defaultFile],
          openFiles: ['src/App.tsx'],
          activeFileId: 'src/App.tsx',
        });
      },

      updateFileContent: (fileId, content) => {
        const updateNode = (nodes: FileNode[]): FileNode[] =>
          nodes.map((node) => {
            if (node.id === fileId) return { ...node, content };
            if (node.children) return { ...node, children: updateNode(node.children) };
            return node;
          });
        set((state) => ({ files: updateNode(state.files) }));
      },

      openFile: (fileId) => {
        set((state) => ({
          openFiles: state.openFiles.includes(fileId) ? state.openFiles : [...state.openFiles, fileId],
          activeFileId: fileId,
        }));
      },

      closeFile: (fileId) => {
        set((state) => {
          const newOpenFiles = state.openFiles.filter((id) => id !== fileId);
          return {
            openFiles: newOpenFiles,
            activeFileId: state.activeFileId === fileId 
              ? (newOpenFiles[newOpenFiles.length - 1] || null) 
              : state.activeFileId,
          };
        });
      },

      setActiveFile: (id) => set({ activeFileId: id }),
      setFiles: (newFiles) => set({ files: newFiles }),
    }),
    {
      name: 'project-storage',
      version: 1,
    }
  )
);
