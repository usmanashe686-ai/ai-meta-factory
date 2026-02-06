import { create } from 'zustand';

export type StackConfig = {
  frontend: 'nextjs' | 'react' | 'flutter';
  backend: 'nodejs' | 'python' | 'none';
  database: 'supabase' | 'firebase' | 'mongodb' | 'planetscale' | 'none';
  gitProvider: 'github' | 'gitlab' | 'bitbucket';
};

export type FileData = {
  content: string;
  language: 'typescript' | 'javascript' | 'python' | 'dart' | 'css' | 'json' | 'yaml' | 'other';
  lastModified: Date;
  aiGenerated: boolean;
  aiContext?: {
    prompt: string;
    timestamp: Date;
  };
};

interface ProjectState {
  // Core Project
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Stack Configuration
  stack: StackConfig;
  
  // File System
  files: Record<string, FileData>;
  activeFile: string | null;
  
  // Actions
  setFile: (path: string, content: string) => void;
  updateFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  createFile: (path: string, content: string, aiGenerated?: boolean) => void;
  setActiveFile: (path: string | null) => void;
  setStack: (stack: Partial<StackConfig>) => void;
  setProjectName: (name: string) => void;
  clearProject: () => void;
}

const detectLanguage = (path: string): FileData['language'] => {
  const ext = path.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'ts': case 'tsx': return 'typescript';
    case 'js': case 'jsx': return 'javascript';
    case 'py': return 'python';
    case 'dart': return 'dart';
    case 'css': case 'scss': return 'css';
    case 'json': return 'json';
    case 'yaml': case 'yml': return 'yaml';
    default: return 'other';
  }
};

const defaultFiles = {
  'src/app/page.tsx': {
    content: `export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to AI Meta Factory</h1>
      <p className="text-gray-400">Start building with AI-generated components</p>
    </main>
  );
}`,
    language: 'typescript' as const,
    lastModified: new Date(),
    aiGenerated: false,
  },
  'package.json': {
    content: JSON.stringify({
      name: 'ai-meta-factory-project',
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        'next': '14.0.0',
        'react': '18.2.0',
        'react-dom': '18.2.0'
      }
    }, null, 2),
    language: 'json' as const,
    lastModified: new Date(),
    aiGenerated: false,
  },
  'tailwind.config.js': {
    content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    language: 'javascript' as const,
    lastModified: new Date(),
    aiGenerated: false,
  }
};

export const useProjectStore = create<ProjectState>((set) => ({
  // Initial state
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
  files: defaultFiles,
  activeFile: 'src/app/page.tsx',
  
  // Actions
  setFile: (path, content) => {
    set((state) => ({
      files: {
        ...state.files,
        [path]: {
          content,
          language: detectLanguage(path),
          lastModified: new Date(),
          aiGenerated: false
        }
      },
      updatedAt: new Date()
    }));
  },
  
  updateFile: (path, content) => {
    set((state) => {
      if (!state.files[path]) return state;
      return {
        files: {
          ...state.files,
          [path]: {
            ...state.files[path],
            content,
            lastModified: new Date()
          }
        },
        updatedAt: new Date()
      };
    });
  },
  
  deleteFile: (path) => {
    set((state) => {
      const newFiles = { ...state.files };
      delete newFiles[path];
      
      let newActiveFile = state.activeFile;
      if (state.activeFile === path) {
        const remainingPaths = Object.keys(newFiles);
        newActiveFile = remainingPaths.length > 0 ? remainingPaths[0] : null;
      }
      
      return {
        files: newFiles,
        activeFile: newActiveFile,
        updatedAt: new Date()
      };
    });
  },
  
  createFile: (path, content, aiGenerated = false) => {
    set((state) => ({
      files: {
        ...state.files,
        [path]: {
          content,
          language: detectLanguage(path),
          lastModified: new Date(),
          aiGenerated
        }
      },
      activeFile: path,
      updatedAt: new Date()
    }));
  },
  
  setActiveFile: (path) => {
    set({ activeFile: path });
  },
  
  setStack: (stack) => {
    set((state) => ({
      stack: { ...state.stack, ...stack },
      updatedAt: new Date()
    }));
  },
  
  setProjectName: (name) => {
    set({ name, updatedAt: new Date() });
  },
  
  clearProject: () => {
    set({
      id: `project_${Date.now()}`,
      name: 'New Project',
      createdAt: new Date(),
      updatedAt: new Date(),
      files: defaultFiles,
      activeFile: 'src/app/page.tsx'
    });
  }
}));
