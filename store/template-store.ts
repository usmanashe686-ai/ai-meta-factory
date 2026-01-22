import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  components: any[];
  layout: any;
  metadata: any;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  downloads: number;
  likes: number;
  isPublic: boolean;
  isFeatured: boolean;
}

interface TemplateState {
  templates: ProjectTemplate[];
  userTemplates: ProjectTemplate[];
  featuredTemplates: ProjectTemplate[];
  categories: string[];
  
  // Actions
  setTemplates: (templates: ProjectTemplate[]) => void;
  setUserTemplates: (templates: ProjectTemplate[]) => void;
  addTemplate: (template: ProjectTemplate) => void;
  updateTemplate: (templateId: string, updates: Partial<ProjectTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  incrementDownloads: (templateId: string) => void;
  incrementLikes: (templateId: string) => void;
  
  // Search & Filter
  searchTemplates: (query: string, category?: string) => ProjectTemplate[];
  getTemplatesByCategory: (category: string) => ProjectTemplate[];
  getPopularTemplates: (limit?: number) => ProjectTemplate[];
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      userTemplates: [],
      featuredTemplates: [],
      categories: [
        'Dashboard',
        'E-commerce',
        'Portfolio',
        'Landing Page',
        'Admin Panel',
        'Mobile App',
        'SAAS',
        'Blog',
        'Education',
        'Healthcare',
      ],
      
      setTemplates: (templates) => set({ templates }),
      
      setUserTemplates: (templates) => set({ userTemplates: templates }),
      
      addTemplate: (template) =>
        set((state) => ({
          templates: [template, ...state.templates],
          userTemplates: [template, ...state.userTemplates],
        })),
      
      updateTemplate: (templateId, updates) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId ? { ...template, ...updates } : template
          ),
          userTemplates: state.userTemplates.map((template) =>
            template.id === templateId ? { ...template, ...updates } : template
          ),
          featuredTemplates: state.featuredTemplates.map((template) =>
            template.id === templateId ? { ...template, ...updates } : template
          ),
        })),
      
      deleteTemplate: (templateId) =>
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== templateId),
          userTemplates: state.userTemplates.filter((template) => template.id !== templateId),
          featuredTemplates: state.featuredTemplates.filter((template) => template.id !== templateId),
        })),
      
      incrementDownloads: (templateId) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId
              ? { ...template, downloads: template.downloads + 1 }
              : template
          ),
        })),
      
      incrementLikes: (templateId) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId
              ? { ...template, likes: template.likes + 1 }
              : template
          ),
        })),
      
      // Search & Filter functions
      searchTemplates: (query, category) => {
        const { templates } = get();
        let filtered = templates.filter((template) => template.isPublic);
        
        if (query) {
          const searchQuery = query.toLowerCase();
          filtered = filtered.filter(
            (template) =>
              template.name.toLowerCase().includes(searchQuery) ||
              template.description.toLowerCase().includes(searchQuery) ||
              template.tags.some((tag) => tag.toLowerCase().includes(searchQuery)) ||
              template.category.toLowerCase().includes(searchQuery)
          );
        }
        
        if (category) {
          filtered = filtered.filter((template) => template.category === category);
        }
        
        return filtered;
      },
      
      getTemplatesByCategory: (category) => {
        const { templates } = get();
        return templates
          .filter((template) => template.isPublic && template.category === category)
          .sort((a, b) => b.downloads - a.downloads);
      },
      
      getPopularTemplates: (limit = 10) => {
        const { templates } = get();
        return templates
          .filter((template) => template.isPublic)
          .sort((a, b) => b.downloads - a.downloads)
          .slice(0, limit);
      },
    }),
    {
      name: 'template-storage',
      version: 1,
    }
  )
);
