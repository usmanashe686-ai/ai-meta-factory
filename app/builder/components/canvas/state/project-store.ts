"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FrontendStack = 'react' | 'nextjs' | 'vue' | 'flutter';
export type BackendStack = 'node' | 'python' | 'go' | 'none';
export type DatabaseStack = 'postgresql' | 'mongodb' | 'sqlite' | 'none';
export type DeploymentStack = 'vercel' | 'netlify' | 'aws' | 'railway' | 'none';

export type StackConfig = {
  frontend: FrontendStack;
  backend: BackendStack;
  database: DatabaseStack;
  deployment: DeploymentStack;
};

export interface FileData {
  content: string;
  isCodeFile: boolean;
  lastModified: number;
  language?: string; // Added missing language property
}

export interface ConsoleEntry {
  type: 'log' | 'error' | 'warning' | 'info' | 'success' | 'ai' | 'command';
  message: string;
  timestamp: number;
}

interface SearchResult {
  path: string;
  name: string;
  content: string;
}

interface ProjectStore {
  name: string;
  stack: StackConfig;
  files: Record<string, FileData>;
  activeFile: string | null;

  // Console state
  consoleOutput: ConsoleEntry[];
  consoleHistory: string[];
  isConsoleRunning: boolean;

  // Actions
  setName: (name: string) => void;
  setStack: (stack: StackConfig) => void;
  createFile: (path: string, content: string, isCodeFile?: boolean) => void;
  updateFile: (path: string, content: string) => void;
  removeFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  copyFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  resetProject: () => void;
  searchFiles: (query: string) => SearchResult[];

  // Console actions
  clearConsole: () => void;
  addToConsole: (entry: ConsoleEntry) => void;
  addToConsoleHistory: (command: string) => void;
  setConsoleRunning: (isRunning: boolean) => void;
}

const DEFAULT_STACK: StackConfig = {
  frontend: 'react',
  backend: 'none',
  database: 'none',
  deployment: 'vercel'
};

const INITIAL_FILES: Record<string, FileData> = {
  'README.md': {
    content: '# Project\n\nWelcome to your new project!',
    isCodeFile: false,
    lastModified: Date.now()
  },
  'package.json': {
    content: JSON.stringify({
      name: 'my-project',
      version: '1.0.0',
      dependencies: {},
      devDependencies: {}
    }, null, 2),
    isCodeFile: true,
    lastModified: Date.now()
  },
  'src/.folder-marker': {
    content: '',
    isCodeFile: false,
    lastModified: Date.now()
  },
  'src/App.tsx': {
    content: `export default function App() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}`,
    isCodeFile: true,
    lastModified: Date.now(),
    language: 'typescript'
  }
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      name: 'New Project',
      stack: DEFAULT_STACK,
      files: INITIAL_FILES,
      activeFile: 'src/App.tsx',
      consoleOutput: [],
      consoleHistory: [],
      isConsoleRunning: false,

      setName: (name) => set({ name }),

      setStack: (stack) => set({ stack }),

      createFile: (path, content, isCodeFile = false) => {
        set((state) => {
          const newFiles = { ...state.files };
          newFiles[path] = {
            content,
            isCodeFile,
            lastModified: Date.now()
          };

          // Create parent directories if they don't exist
          const parts = path.split('/');
          if (parts.length > 1) {
            for (let i = 1; i < parts.length; i++) {
              const dirPath = parts.slice(0, i).join('/');
              if (!newFiles[`${dirPath}/.folder-marker`]) {
                newFiles[`${dirPath}/.folder-marker`] = {
                  content: '',
                  isCodeFile: false,
                  lastModified: Date.now()
                };
              }
            }
          }

          return { files: newFiles };
        });
      },

      updateFile: (path, content) => {
        set((state) => {
          const file = state.files[path];
          if (!file) return state;

          const newFiles = { ...state.files };
          newFiles[path] = {
            ...file,
            content,
            lastModified: Date.now()
          };

          return { files: newFiles };
        });
      },

      removeFile: (path) => {
        set((state) => {
          const newFiles = { ...state.files };
          delete newFiles[path];

          // Clean up empty directories
          const parts = path.split('/');
          if (parts.length > 1) {
            const dirPath = parts.slice(0, parts.length - 1).join('/');
            const hasOtherFiles = Object.keys(newFiles).some(filePath =>
              filePath.startsWith(dirPath + '/') &&
              !filePath.includes('.folder-marker')
            );

            if (!hasOtherFiles && dirPath) {
              delete newFiles[`${dirPath}/.folder-marker`];
            }
          }

          return {
            files: newFiles,
            activeFile: state.activeFile === path ? null : state.activeFile
          };
        });
      },

      renameFile: (oldPath, newPath) => {
        set((state) => {
          const file = state.files[oldPath];
          if (!file) return state;

          const newFiles = { ...state.files };
          delete newFiles[oldPath];
          newFiles[newPath] = file;

          return {
            files: newFiles,
            activeFile: state.activeFile === oldPath ? newPath : state.activeFile
          };
        });
      },

      copyFile: (path) => {
        set((state) => {
          const file = state.files[path];
          if (!file) return state;

          const extension = path.split('.').pop();
          const baseName = path.replace(/\.[^/.]+$/, '');
          const copyPath = `${baseName}.copy.${extension}`;

          const newFiles = { ...state.files };
          newFiles[copyPath] = {
            ...file,
            lastModified: Date.now()
          };

          return { files: newFiles };
        });
      },

      setActiveFile: (path) => set({ activeFile: path }),

      resetProject: () => set({
        name: 'New Project',
        stack: DEFAULT_STACK,
        files: INITIAL_FILES,
        activeFile: 'src/App.tsx',
        consoleOutput: [],
        consoleHistory: [],
        isConsoleRunning: false
      }),

      searchFiles: (query) => {
        const { files } = get();
        const results: SearchResult[] = [];

        Object.entries(files).forEach(([path, file]) => {
          if (path.includes('.folder-marker')) return;

          if (path.toLowerCase().includes(query.toLowerCase()) ||
              file.content.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              path,
              name: path.split('/').pop() || path,
              content: file.content
            });
          }
        });

        return results;
      },

      // Console actions
      clearConsole: () => set({ consoleOutput: [] }),

      addToConsole: (entry) => {
        set((state) => ({
          consoleOutput: [...state.consoleOutput, entry]
        }));
      },

      addToConsoleHistory: (command) => {
        set((state) => ({
          consoleHistory: [...state.consoleHistory, command]
        }));
      },

      setConsoleRunning: (isRunning) => set({ isConsoleRunning: isRunning })
    }),
    {
      name: 'project-store',
      partialize: (state) => ({
        name: state.name,
        stack: state.stack,
        files: state.files,
        activeFile: state.activeFile,
        // We might not want to persist console output and history, but let's do for now
        consoleOutput: state.consoleOutput,
        consoleHistory: state.consoleHistory,
        isConsoleRunning: state.isConsoleRunning
      })
    }
  )
);

// Helper function to detect language from file path
export const detectLanguage = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'py':
      return 'python';
    case 'dart':
      return 'dart';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'scss':
    case 'sass':
      return 'scss';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'sql':
      return 'sql';
    case 'sh':
      return 'shell';
    case 'dockerfile':
      return 'dockerfile';
    default:
      return 'plaintext';
  }
};

// Console API for easy logging
export const consoleAPI = {
  log: (message: string) => {
    useProjectStore.getState().addToConsole({
      type: 'log',
      message,
      timestamp: Date.now()
    });
  },
  error: (message: string) => {
    useProjectStore.getState().addToConsole({
      type: 'error',
      message,
      timestamp: Date.now()
    });
  },
  success: (message: string) => {
    useProjectStore.getState().addToConsole({
      type: 'success',
      message,
      timestamp: Date.now()
    });
  },
  ai: (message: string) => {
    useProjectStore.getState().addToConsole({
      type: 'ai',
      message,
      timestamp: Date.now()
    });
  },
  command: (message: string) => {
    useProjectStore.getState().addToConsole({
      type: 'command',
      message,
      timestamp: Date.now()
    });
  }
};
