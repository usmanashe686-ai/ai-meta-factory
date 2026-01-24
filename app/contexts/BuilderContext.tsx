"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface CanvasComponent {
  id: string;
  type: 'container' | 'text' | 'button' | 'input' | 'custom';
  content: string;
  position: { x: number; y: number };
  styles: Record<string, string>;
  code?: string;
}

interface BuilderContextType {
  components: CanvasComponent[];
  addComponent: (component: Omit<CanvasComponent, 'id'>) => void;
  updateComponent: (id: string, updates: Partial<CanvasComponent>) => void;
  removeComponent: (id: string) => void;
  selectedComponent: string | null;
  setSelectedComponent: (id: string | null) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [components, setComponents] = useState<CanvasComponent[]>([
    {
      id: 'welcome-component',
      type: 'container',
      content: 'Welcome to Meta Factory Builder',
      position: { x: 100, y: 100 },
      styles: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    }
  ]);
  
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const addComponent = (componentData: Omit<CanvasComponent, 'id'>) => {
    const newComponent: CanvasComponent = {
      ...componentData,
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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

  return (
    <BuilderContext.Provider value={{
      components,
      addComponent,
      updateComponent,
      removeComponent,
      selectedComponent,
      setSelectedComponent
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
