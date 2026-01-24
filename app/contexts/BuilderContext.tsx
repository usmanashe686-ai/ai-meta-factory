"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

export type Component = {
  id: string;
  type: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  fontSize: number;
  borderRadius: number;
};

type BuilderContextType = {
  components: Component[];
  selectedComponent: Component | null;
  addComponent: (type: string) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (component: Component | null) => void;
};

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [components, setComponents] = useState<Component[]>([
    {
      id: '1',
      type: 'text',
      content: 'Welcome to Meta Factory AI Builder',
      x: 100,
      y: 100,
      width: 350,
      height: 80,
      bgColor: '#ffffff',
      textColor: '#000000',
      fontSize: 24,
      borderRadius: 8
    },
    {
      id: '2',
      type: 'button',
      content: 'Click Me',
      x: 150,
      y: 200,
      width: 140,
      height: 48,
      bgColor: '#3b82f6',
      textColor: '#ffffff',
      fontSize: 16,
      borderRadius: 8
    },
    {
      id: '3',
      type: 'card',
      content: 'AI Generated Component',
      x: 300,
      y: 150,
      width: 280,
      height: 160,
      bgColor: '#f8fafc',
      textColor: '#334155',
      fontSize: 18,
      borderRadius: 12
    }
  ]);

  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  const addComponent = (type: string) => {
    const newComponent: Component = {
      id: Date.now().toString(),
      type,
      content: type === 'button' ? 'Click Me' : 
               type === 'card' ? 'Card Content' : 
               type === 'input' ? 'Enter text...' : 'Text Content',
      x: 50 + Math.random() * 500,
      y: 50 + Math.random() * 300,
      width: type === 'button' ? 140 : 
             type === 'input' ? 200 : 
             type === 'card' ? 280 : 350,
      height: type === 'button' ? 48 : 
              type === 'input' ? 40 : 
              type === 'card' ? 160 : 100,
      bgColor: type === 'button' ? '#3b82f6' : 
               type === 'card' ? '#f8fafc' : '#ffffff',
      textColor: type === 'button' ? '#ffffff' : '#000000',
      fontSize: type === 'button' ? 16 : 18,
      borderRadius: 8
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent);
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
    
    if (selectedComponent?.id === id) {
      setSelectedComponent(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  };

  const selectComponent = (component: Component | null) => {
    setSelectedComponent(component);
  };

  return (
    <BuilderContext.Provider value={{
      components,
      selectedComponent,
      addComponent,
      updateComponent,
      removeComponent,
      selectComponent
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
