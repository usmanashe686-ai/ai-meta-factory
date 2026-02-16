import { create } from 'zustand';
import { Template } from '../templates/TemplateLibrary';

export interface ProjectFile {
  path: string;
  content: string;
  isFolder?: boolean;
}

export interface Project {
  id: string;
  name: string;
  files: ProjectFile[];
}

export interface ConsoleEntry {
  type: 'command' | 'ai' | 'error' | 'info';
  message: string;
  timestamp?: Date;
}

interface ProjectState {
  project: Project | null;
  files: ProjectFile[];
  isSaving: boolean;
  console: ConsoleEntry[];
  createProjectFromTemplate: (template: Template) => Promise<string>;
  saveProject: () => Promise<void>;
  createFile: (path: string, content: string, isFolder?: boolean) => void;
  updateFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  addToConsole: (entry: Omit<ConsoleEntry, 'timestamp'>) => void;
  clearConsole: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  files: [],
  isSaving: false,
  console: [],
  createProjectFromTemplate: async (template) => {
    const projectId = 'proj-' + Date.now();
    const files: ProjectFile[] = Object.entries(template.files).map(([path, content]) => ({
      path,
      content,
      isFolder: false,
    }));
    const newProject: Project = {
      id: projectId,
      name: template.name,
      files,
    };
    set({ project: newProject, files });
    return projectId;
  },
  saveProject: async () => {
    set({ isSaving: true });
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isSaving: false });
  },
  createFile: (path, content, isFolder = false) => {
    const { files } = get();
    const newFile: ProjectFile = { path, content, isFolder };
    set({ files: [...files, newFile] });
  },
  updateFile: (path, content) => {
    const { files } = get();
    set({
      files: files.map(f => (f.path === path ? { ...f, content } : f))
    });
  },
  deleteFile: (path) => {
    const { files } = get();
    set({ files: files.filter(f => f.path !== path) });
  },
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
