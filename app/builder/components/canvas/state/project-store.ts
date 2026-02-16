import { create } from 'zustand';
import { Template } from '../templates/TemplateLibrary';

export interface Project {
  id: string;
  name: string;
  files: Record<string, string>;
}

interface ProjectState {
  project: Project | null;
  isSaving: boolean;
  createProjectFromTemplate: (template: Template) => Promise<string>;
  saveProject: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  isSaving: false,
  createProjectFromTemplate: async (template) => {
    const projectId = 'proj-' + Date.now();
    const newProject: Project = {
      id: projectId,
      name: template.name,
      files: template.files,
    };
    set({ project: newProject });
    return projectId;
  },
  saveProject: async () => {
    set({ isSaving: true });
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isSaving: false });
  },
}));
