"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

// Define proper types
export type Component = {
  id: string;
  content: string;
  styles: {
    position: string;
    left: string;
    top: string;
    padding: string;
    background: string;
    border: string;
    borderRadius: string;
    cursor: string;
    minWidth?: string;
    minHeight?: string;
  };
};

type BuilderContextType = {
  components: Component[];
  addComponent: () => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
};

export const SimpleBuilderContext = createContext<BuilderContextType | null>(null);

export function SimpleBuilderProvider({ children }: { children: ReactNode }) {
  const [components, setComponents] = useState<Component[]>([
    {
      id: 'demo-1',
      content: 'Welcome to Meta Factory AI Builder',
      styles: {
        position: 'absolute',
        left: '100px',
        top: '100px',
        padding: '20px',
        background: 'white',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        cursor: 'move',
        minWidth: '150px',
        minHeight: '60px'
      }
    }
  ]);

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('demo-1');

  const addComponent = () => {
    const newComponent: Component = {
      id: `comp-${Date.now()}`,
      content: `Component ${components.length + 1}`,
      styles: {
        position: 'absolute',
        left: `${100 + components.length * 50}px`,
        top: `${100 + components.length * 50}px`,
        padding: '16px',
        background: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        cursor: 'move',
        minWidth: '150px',
        minHeight: '60px'
      }
    };
    setComponents([...components, newComponent]);
    setSelectedComponentId(newComponent.id);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(components.length > 1 ? components[0].id : null);
    }
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  return (
    <SimpleBuilderContext.Provider value={{
      components,
      addComponent,
      removeComponent,
      updateComponent,
      selectedComponentId,
      setSelectedComponentId
    }}>
      {children}
    </SimpleBuilderContext.Provider>
  );
}

export const useSimpleBuilder = () => {
  const context = useContext(SimpleBuilderContext);
  if (!context) {
    throw new Error('useSimpleBuilder must be used within SimpleBuilderProvider');
  }
  return context;
};
