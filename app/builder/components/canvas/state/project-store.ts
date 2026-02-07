import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface FileData {
  id: string;
  path: string;
  content: string;
  language: string;
  lastModified: Date;
}

export interface StackConfig {
  frontend: 'react' | 'nextjs' | 'flutter' | 'vue' | 'svelte';
  backend: 'node' | 'python' | 'go' | 'none';
  database: 'postgresql' | 'mongodb' | 'sqlite' | 'none';
  deployment: 'vercel' | 'netlify' | 'docker' | 'serverless';
}

export interface ConsoleEntry {
  id: string;
  message: string;
  type: 'log' | 'error' | 'success' | 'info' | 'warning' | 'command' | 'ai';
  timestamp: number;
  source?: 'build' | 'preview' | 'ai' | 'system' | 'terminal';
}

export interface ProjectState {
  // Project info
  name: string;
  description: string;
  stack: StackConfig;
  
  // Files
  files: Record<string, FileData>;
  activeFile: string | null;
  
  // UI state
  isPreviewVisible: boolean;
  isConsoleVisible: boolean;
  
  // Console system
  consoleOutput: ConsoleEntry[];
  consoleHistory: string[];
  isConsoleRunning: boolean;
  
  // Actions
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setStack: (stack: StackConfig) => void;
  
  // File actions
  createFile: (path: string, content: string, isCodeFile: boolean) => void;
  updateFile: (path: string, content: string) => void;
  removeFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  copyFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  
  // UI actions
  togglePreview: () => void;
  toggleConsole: () => void;
  
  // Console actions
  addConsoleEntry: (entry: Omit<ConsoleEntry, 'id' | 'timestamp'>) => void;
  addConsoleOutput: (message: string, type?: ConsoleEntry['type'], source?: ConsoleEntry['source']) => void;
  clearConsole: () => void;
  addToConsoleHistory: (command: string) => void;
  setConsoleRunning: (isRunning: boolean) => void;
  
  // Project actions
  resetProject: () => void;
  
  // Search
  searchFiles: (query: string) => Array<{ path: string; name: string }>;
}

const defaultStack: StackConfig = {
  frontend: 'react',
  backend: 'none',
  database: 'none',
  deployment: 'vercel'
};

const defaultFiles: Record<string, FileData> = {
  'README.md': {
    id: 'readme',
    path: 'README.md',
    content: '# Project\n\nThis is a new project created with AI Meta Factory.',
    language: 'markdown',
    lastModified: new Date()
  },
  'package.json': {
    id: 'package',
    path: 'package.json',
    content: JSON.stringify({
      name: 'new-project',
      version: '1.0.0',
      dependencies: {
        'react': '^18.0.0',
        'react-dom': '^18.0.0'
      }
    }, null, 2),
    language: 'json',
    lastModified: new Date()
  },
  'src/App.tsx': {
    id: 'app',
    path: 'src/App.tsx',
    content: `export default function App() {
  return (
    <div className="App">
      <h1>Hello, World!</h1>
      <p>Start editing to see changes.</p>
    </div>
  );
}`,
    language: 'typescript',
    lastModified: new Date()
  }
};

const getLanguage = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts': return 'typescript';
    case 'tsx': return 'typescript';
    case 'js': return 'javascript';
    case 'jsx': return 'javascript';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'css': return 'css';
    case 'scss': return 'scss';
    case 'html': return 'html';
    case 'py': return 'python';
    case 'dart': return 'dart';
    default: return 'text';
  }
};

// Helper to generate unique ID
const generateId = () => `console_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      // Initial state
      name: 'New Project',
      description: '',
      stack: defaultStack,
      files: defaultFiles,
      activeFile: 'src/App.tsx',
      isPreviewVisible: true,
      isConsoleVisible: false,
      consoleOutput: [
        { id: generateId(), message: 'Welcome to AI Meta Factory Console', type: 'info', timestamp: Date.now(), source: 'system' },
        { id: generateId(), message: 'Starting development environment...', type: 'info', timestamp: Date.now(), source: 'system' },
        { id: generateId(), message: 'Ready on http://localhost:3000', type: 'success', timestamp: Date.now(), source: 'system' }
      ],
      consoleHistory: [],
      isConsoleRunning: false,
      
      // Actions
      setName: (name) => set({ name }),
      setDescription: (description) => set({ description }),
      setStack: (stack) => set({ stack }),
      
      createFile: (path, content, isCodeFile) => {
        const language = getLanguage(path);
        const newFile: FileData = {
          id: Date.now().toString(),
          path,
          content,
          language,
          lastModified: new Date()
        };
        
        set((state) => ({
          files: { ...state.files, [path]: newFile },
          activeFile: path
        }));
        
        // Log file creation
        get().addConsoleOutput(`Created file: ${path}`, 'success', 'system');
      },
      
      updateFile: (path, content) => {
        set((state) => {
          const file = state.files[path];
          if (!file) return state;
          
          return {
            files: {
              ...state.files,
              [path]: {
                ...file,
                content,
                lastModified: new Date()
              }
            }
          };
        });
      },
      
      removeFile: (path) => {
        set((state) => {
          const newFiles = { ...state.files };
          delete newFiles[path];
          
          let newActiveFile = state.activeFile;
          if (state.activeFile === path) {
            const remainingFiles = Object.keys(newFiles);
            newActiveFile = remainingFiles.length > 0 ? remainingFiles[0] : null;
          }
          
          return {
            files: newFiles,
            activeFile: newActiveFile
          };
        });
        
        get().addConsoleOutput(`Deleted file: ${path}`, 'warning', 'system');
      },
      
      renameFile: (oldPath, newPath) => {
        set((state) => {
          const file = state.files[oldPath];
          if (!file) return state;
          
          const newFiles = { ...state.files };
          delete newFiles[oldPath];
          
          const updatedFile = {
            ...file,
            path: newPath,
            language: getLanguage(newPath)
          };
          
          newFiles[newPath] = updatedFile;
          
          return {
            files: newFiles,
            activeFile: state.activeFile === oldPath ? newPath : state.activeFile
          };
        });
        
        get().addConsoleOutput(`Renamed: ${oldPath} → ${newPath}`, 'info', 'system');
      },
      
      copyFile: (path) => {
        set((state) => {
          const file = state.files[path];
          if (!file) return state;
          
          const ext = path.split('.').pop();
          const baseName = path.replace(/\.[^/.]+$/, '');
          const newPath = `${baseName}_copy.${ext}`;
          
          const newFile: FileData = {
            ...file,
            id: Date.now().toString(),
            path: newPath,
            lastModified: new Date()
          };
          
          return {
            files: { ...state.files, [newPath]: newFile },
            activeFile: newPath
          };
        });
        
        get().addConsoleOutput(`Copied file: ${path}`, 'info', 'system');
      },
      
      setActiveFile: (path) => set({ activeFile: path }),
      
      togglePreview: () => set((state) => ({ isPreviewVisible: !state.isPreviewVisible })),
      toggleConsole: () => set((state) => ({ isConsoleVisible: !state.isConsoleVisible })),
      
      // Console actions
      addConsoleEntry: (entry) => set((state) => ({
        consoleOutput: [
          ...state.consoleOutput,
          {
            ...entry,
            id: generateId(),
            timestamp: Date.now()
          }
        ].slice(-100) // Keep last 100 entries to prevent memory issues
      })),
      
      addConsoleOutput: (message, type = 'log', source = 'system') => {
        get().addConsoleEntry({ message, type, source });
      },
      
      clearConsole: () => set({ 
        consoleOutput: [],
        consoleHistory: []
      }),
      
      addToConsoleHistory: (command) => set((state) => ({
        consoleHistory: [...state.consoleHistory, command].slice(-50) // Keep last 50 commands
      })),
      
      setConsoleRunning: (isRunning) => set({ isConsoleRunning: isRunning }),
      
      resetProject: () => set({
        name: 'New Project',
        description: '',
        stack: defaultStack,
        files: defaultFiles,
        activeFile: 'src/App.tsx',
        consoleOutput: [
          { id: generateId(), message: 'Project reset successfully', type: 'success', timestamp: Date.now(), source: 'system' }
        ],
        consoleHistory: [],
        isConsoleRunning: false
      }),
      
      searchFiles: (query) => {
        const state = get();
        const results: Array<{ path: string; name: string }> = [];
        
        Object.keys(state.files).forEach(path => {
          if (path.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              path,
              name: path.split('/').pop() || path
            });
          }
        });
        
        return results;
      }
    }),
    { name: 'project-store' }
  )
);

export function detectLanguage(path: string): string {
  return getLanguage(path);
}

// Export console helper functions for use throughout the app
export const consoleAPI = {
  log: (message: string, source?: ConsoleEntry['source']) => {
    useProjectStore.getState().addConsoleOutput(message, 'log', source);
  },
  
  error: (message: string, source?: ConsoleEntry['source']) => {
    useProjectStore.getState().addConsoleOutput(message, 'error', source);
  },
  
  success: (message: string, source?: ConsoleEntry['source']) => {
    useProjectStore.getState().addConsoleOutput(message, 'success', source);
  },
  
  info: (message: string, source?: ConsoleEntry['source']) => {
    useProjectStore.getState().addConsoleOutput(message, 'info', source);
  },
  
  warn: (message: string, source?: ConsoleEntry['source']) => {
    useProjectStore.getState().addConsoleOutput(message, 'warning', source);
  },
  
  ai: (message: string) => {
    useProjectStore.getState().addConsoleOutput(message, 'ai', 'ai');
  },
  
  command: (command: string) => {
    const state = useProjectStore.getState();
    state.addConsoleOutput(`$ ${command}`, 'command', 'terminal');
    state.addToConsoleHistory(command);
  },
  
  build: (message: string) => {
    useProjectStore.getState().addConsoleOutput(message, 'info', 'build');
  },
  
  preview: (message: string) => {
    useProjectStore.getState().addConsoleOutput(message, 'info', 'preview');
  }
};
