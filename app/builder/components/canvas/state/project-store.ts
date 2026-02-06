"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FileData {
  content: string;
  language: 'typescript' | 'javascript' | 'python' | 'dart' | 'css' | 'json' | 'yaml' | 'html' | 'md';
  lastModified: Date;
  aiGenerated: boolean;
  aiContext?: {
    prompt: string;
    timestamp: Date;
  };
}

export interface ProjectState {
  // Core Project
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Stack Configuration
  stack: {
    frontend: 'nextjs' | 'react' | 'flutter';
    backend: 'nodejs' | 'python' | 'none';
    database: 'supabase' | 'firebase' | 'mongodb' | 'planetscale' | 'none';
    gitProvider: 'github' | 'gitlab' | 'bitbucket' | 'none';
  };
  
  // File System
  files: Record<string, FileData>;
  activeFile: string | null;
  
  // AI Context
  aiContext: {
    generationPrompt: string;
    history: Array<{role: string, content: string}>;
    suggestions: Array<{file: string, suggestion: string}>;
  };
  
  // Preview State
  preview: {
    url: string | null;
    status: 'idle' | 'building' | 'running' | 'error';
    logs: string[];
  };
  
  // Export State
  export: {
    status: 'idle' | 'exporting' | 'uploading' | 'complete';
    url: string | null;
    size: number;
  };
}

interface ProjectStore extends ProjectState {
  // File Actions
  setActiveFile: (path: string | null) => void;
  setFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  createFile: (path: string, content?: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  duplicateFile: (path: string) => void;
  
  // Project Actions
  setProjectName: (name: string) => void;
  setStack: (stack: Partial<ProjectState['stack']>) => void;
  
  // Preview Actions
  updatePreview: (preview: Partial<ProjectState['preview']>) => void;
  
  // AI Actions
  addAIMessage: (role: string, content: string) => void;
  setAISuggestions: (suggestions: Array<{file: string, suggestion: string}>) => void;
  
  // Export Actions
  startExport: () => void;
  completeExport: (url: string, size: number) => void;
  
  // Reset
  resetProject: () => void;
}

const detectLanguage = (path: string): FileData['language'] => {
  const extension = path.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'ts': case 'tsx':
      return 'typescript';
    case 'js': case 'jsx':
      return 'javascript';
    case 'py':
      return 'python';
    case 'dart':
      return 'dart';
    case 'css': case 'scss':
      return 'css';
    case 'json':
      return 'json';
    case 'yaml': case 'yml':
      return 'yaml';
    case 'html':
      return 'html';
    case 'md':
      return 'md';
    default:
      return 'typescript';
  }
};

const initialState: ProjectState = {
  id: `project_${Date.now()}`,
  name: 'New Project',
  createdAt: new Date(),
  updatedAt: new Date(),
  stack: {
    frontend: 'nextjs',
    backend: 'nodejs',
    database: 'supabase',
    gitProvider: 'github'
  },
  files: {},
  activeFile: null,
  aiContext: {
    generationPrompt: '',
    history: [],
    suggestions: []
  },
  preview: {
    url: null,
    status: 'idle',
    logs: []
  },
  export: {
    status: 'idle',
    url: null,
    size: 0
  }
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // File Actions
      setActiveFile: (path) => {
        set({ activeFile: path });
      },
      
      setFile: (path, content) => {
        set((state) => {
          const files = { ...state.files };
          const language = detectLanguage(path);
          
          files[path] = {
            content,
            language,
            lastModified: new Date(),
            aiGenerated: false
          };
          
          return {
            files,
            updatedAt: new Date()
          };
        });
      },
      
      deleteFile: (path) => {
        set((state) => {
          const files = { ...state.files };
          delete files[path];
          
          let activeFile = state.activeFile;
          if (activeFile === path) {
            activeFile = Object.keys(files)[0] || null;
          }
          
          return {
            files,
            activeFile,
            updatedAt: new Date()
          };
        });
      },
      
      createFile: (path, content = '') => {
        set((state) => {
          const files = { ...state.files };
          const language = detectLanguage(path);
          
          files[path] = {
            content,
            language,
            lastModified: new Date(),
            aiGenerated: false
          };
          
          return {
            files,
            activeFile: path,
            updatedAt: new Date()
          };
        });
      },
      
      renameFile: (oldPath, newPath) => {
        set((state) => {
          const files = { ...state.files };
          
          if (!files[oldPath]) {
            console.warn(`File ${oldPath} does not exist`);
            return state;
          }
          
          // Move the file
          files[newPath] = {
            ...files[oldPath],
            lastModified: new Date()
          };
          delete files[oldPath];
          
          // Update active file if it was the renamed file
          let activeFile = state.activeFile;
          if (activeFile === oldPath) {
            activeFile = newPath;
          }
          
          // Update all import statements in other files
          const updatedFiles = { ...files };
          Object.keys(updatedFiles).forEach(filePath => {
            const file = updatedFiles[filePath];
            
            // Update import paths (simple string replace for now)
            // This is a basic implementation - you might want to use AST for production
            let updatedContent = file.content;
            
            // Replace relative imports
            const oldImportPath = oldPath.replace(/\.[^/.]+$/, '');
            const newImportPath = newPath.replace(/\.[^/.]+$/, '');
            
            // Simple regex to update import statements
            const importRegex = new RegExp(`from ['"]\\.?/?${oldImportPath.replace(/\//g, '\\/')}['"]`, 'g');
            updatedContent = updatedContent.replace(importRegex, `from './${newImportPath}'`);
            
            // Update require statements
            const requireRegex = new RegExp(`require\\(['"]\\.?/?${oldImportPath.replace(/\//g, '\\/')}['"]\\)`, 'g');
            updatedContent = updatedContent.replace(requireRegex, `require('./${newImportPath}')`);
            
            if (updatedContent !== file.content) {
              updatedFiles[filePath] = {
                ...file,
                content: updatedContent,
                lastModified: new Date()
              };
            }
          });
          
          return {
            files: updatedFiles,
            activeFile,
            updatedAt: new Date()
          };
        });
      },
      
      duplicateFile: (path) => {
        set((state) => {
          const files = { ...state.files };
          
          if (!files[path]) {
            console.warn(`File ${path} does not exist`);
            return state;
          }
          
          // Generate new path (file-copy.tsx, file-copy2.tsx, etc.)
          const extension = path.split('.').pop();
          const baseName = path.replace(`.${extension}`, '');
          let newPath = '';
          let counter = 1;
          
          do {
            newPath = `${baseName}-copy${counter > 1 ? counter : ''}.${extension}`;
            counter++;
          } while (files[newPath] && counter < 100);
          
          files[newPath] = {
            ...files[path],
            lastModified: new Date()
          };
          
          return {
            files,
            updatedAt: new Date()
          };
        });
      },
      
      // Project Actions
      setProjectName: (name) => {
        set({ name, updatedAt: new Date() });
      },
      
      setStack: (stack) => {
        set((state) => ({
          stack: { ...state.stack, ...stack },
          updatedAt: new Date()
        }));
      },
      
      // Preview Actions
      updatePreview: (preview) => {
        set((state) => ({
          preview: { ...state.preview, ...preview }
        }));
      },
      
      // AI Actions
      addAIMessage: (role, content) => {
        set((state) => ({
          aiContext: {
            ...state.aiContext,
            history: [...state.aiContext.history, { role, content }]
          }
        }));
      },
      
      setAISuggestions: (suggestions) => {
        set((state) => ({
          aiContext: {
            ...state.aiContext,
            suggestions
          }
        }));
      },
      
      // Export Actions
      startExport: () => {
        set({
          export: {
            status: 'exporting',
            url: null,
            size: 0
          }
        });
      },
      
      completeExport: (url, size) => {
        set({
          export: {
            status: 'complete',
            url,
            size
          }
        });
      },
      
      // Reset
      resetProject: () => {
        set({
          ...initialState,
          id: `project_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }),
    {
      name: 'ai-meta-factory-project',
      partialize: (state) => ({
        id: state.id,
        name: state.name,
        stack: state.stack,
        files: state.files,
        activeFile: state.activeFile,
        aiContext: state.aiContext,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt
      }),
    }
  )
);

// Helper functions
export const useFileSystem = () => {
  const store = useProjectStore();
  
  return {
    // Get file tree structure
    getFileTree: () => {
      const files = store.files;
      const tree: any = {};
      
      Object.keys(files).forEach(path => {
        const parts = path.split('/');
        let current = tree;
        
        parts.forEach((part, index) => {
          if (!current[part]) {
            current[part] = index === parts.length - 1 
              ? { type: 'file', path }
              : { type: 'folder', children: {} };
          }
          if (index < parts.length - 1) {
            current = current[part].children;
          }
        });
      });
      
      return tree;
    },
    
    // Search files
    searchFiles: (query: string) => {
      const files = store.files;
      const results: Array<{path: string, content: string, matches: number}> = [];
      
      Object.entries(files).forEach(([path, file]) => {
        const contentLower = file.content.toLowerCase();
        const queryLower = query.toLowerCase();
        
        if (path.toLowerCase().includes(queryLower) || contentLower.includes(queryLower)) {
          // Count matches
          const matches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
          results.push({ path, content: file.content, matches });
        }
      });
      
      return results.sort((a, b) => b.matches - a.matches);
    },
    
    // Get file statistics
    getStats: () => {
      const files = store.files;
      const totalFiles = Object.keys(files).length;
      const totalLines = Object.values(files).reduce((sum, file) => 
        sum + file.content.split('\n').length, 0
      );
      const totalChars = Object.values(files).reduce((sum, file) => 
        sum + file.content.length, 0
      );
      
      return { totalFiles, totalLines, totalChars };
    }
  };
};
