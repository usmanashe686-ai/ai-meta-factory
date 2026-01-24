"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { CanvasComponent } from '@/types';

interface BuilderContextType {
  components: CanvasComponent[];
  selectedComponent: string | null;
  projectName: string;
  
  // Actions
  addComponent: (component: Omit<CanvasComponent, 'id'>) => void;
  updateComponent: (id: string, updates: Partial<CanvasComponent>) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  setSelectedComponent: (id: string | null) => void;
  setProjectName: (name: string) => void;
  resetCanvas: () => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [components, setComponents] = useState<CanvasComponent[]>([
    {
      id: 'welcome',
      type: 'card',
      content: '🏭 Welcome to Meta Factory AI Builder\n\n• Click components to select\n• Drag to move\n• Edit properties on right\n• Generate with AI',
      position: { x: 100, y: 100 },
      styles: {
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '350px',
        minHeight: '200px',
        fontSize: '14px',
        lineHeight: '1.6',
        border: '2px solid #3b82f6'
      }
    }
  ]);
  
  const [selectedComponent, setSelectedComponent] = useState<string | null>('welcome');
  const [projectName, setProjectName] = useState<string>('My Project');

  const addComponent = (componentData: Omit<CanvasComponent, 'id'>) => {
    const newComponent: CanvasComponent = {
      ...componentData,
      id: \`comp-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`
    };
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent.id);
  };

  const updateComponent = (id: string, updates: Partial<CanvasComponent>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
    if (selectedComponent === id) setSelectedComponent(null);
  };

  const duplicateComponent = (id: string) => {
    const component = components.find(c => c.id === id);
    if (component) {
      const duplicated: CanvasComponent = {
        ...component,
        id: \`comp-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
        position: {
          x: component.position.x + 20,
          y: component.position.y + 20
        }
      };
      setComponents([...components, duplicated]);
      setSelectedComponent(duplicated.id);
    }
  };

  const resetCanvas = () => {
    setComponents([{
      id: 'welcome',
      type: 'card',
      content: '🏭 Welcome to Meta Factory AI Builder\n\n• Click components to select\n• Drag to move\n• Edit properties on right\n• Generate with AI',
      position: { x: 100, y: 100 },
      styles: {
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '350px',
        minHeight: '200px',
        fontSize: '14px',
        lineHeight: '1.6',
        border: '2px solid #3b82f6'
      }
    }]);
    setSelectedComponent('welcome');
  };

  return (
    <BuilderContext.Provider value={{
      components,
      selectedComponent,
      projectName,
      addComponent,
      updateComponent,
      removeComponent,
      duplicateComponent,
      setSelectedComponent,
      setProjectName,
      resetCanvas
    }}>
      {children}
    </BuilderContext.Provider>
  );
}

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within BuilderProvider');
  }
  return context;
};
