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

interface ProjectState {
  project: Project | null;
  files: ProjectFile[];
  isSaving: boolean;
  createProjectFromTemplate: (template: Template) => Promise<string>;
  saveProject: () => Promise<void>;
  createFile: (path: string, content: string, isFolder?: boolean) => void;
  updateFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  files: [],
  isSaving: false,
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
}));
