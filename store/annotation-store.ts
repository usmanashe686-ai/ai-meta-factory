import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AnnotationTool = 'pen' | 'rectangle' | 'circle' | 'text' | 'arrow' | 'note';

export interface Annotation {
  id: string;
  projectId: string;
  type: AnnotationTool;
  points: number[];
  color: string;
  strokeWidth: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface AnnotationStore {
  annotations: Annotation[];
  selectedTool: AnnotationTool;
  color: string;
  strokeWidth: number;
  
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  removeAnnotation: (annotationId: string) => void;
  clearProjectAnnotations: (projectId: string) => void;
  setSelectedTool: (tool: AnnotationTool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  getProjectAnnotations: (projectId: string) => Annotation[];
}

export const useAnnotationStore = create<AnnotationStore>()(
  persist(
    (set, get) => ({
      annotations: [],
      selectedTool: 'pen',
      color: '#3b82f6',
      strokeWidth: 2,
      
      addAnnotation: (annotationData) => {
        const newAnnotation: Annotation = {
          ...annotationData,
          id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          annotations: [...state.annotations, newAnnotation]
        }));
        
        if (typeof window !== 'undefined' && (window as any).socket) {
          (window as any).socket.emit('annotation-added', newAnnotation);
        }
      },
      
      removeAnnotation: (annotationId) => {
        set((state) => ({
          annotations: state.annotations.filter((ann) => ann.id !== annotationId)
        }));
      },
      
      clearProjectAnnotations: (projectId) => {
        set((state) => ({
          annotations: state.annotations.filter((ann) => ann.projectId !== projectId)
        }));
      },
      
      setSelectedTool: (tool) => {
        set({ selectedTool: tool });
      },
      
      setColor: (color) => {
        set({ color });
      },
      
      setStrokeWidth: (width) => {
        set({ strokeWidth: width });
      },
      
      getProjectAnnotations: (projectId) => {
        const state = get();
        return state.annotations.filter((ann) => ann.projectId === projectId);
      }
    }),
    {
      name: 'annotation-storage',
      version: 1
    }
  )
);
