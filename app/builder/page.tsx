"use client";

import { useState, useEffect, useCallback } from 'react';
import { DndContext, DragEndEvent, closestCenter, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Component Types
type Component = {
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
  isAI?: boolean;
  aiPrompt?: string;
};

// Draggable Component
function DraggableComponent({
  component,
  isSelected,
  onClick,
  onDelete
}: {
  component: Component;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: component.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${component.x}px`,
    top: `${component.y}px`,
    width: `${component.width}px`,
    height: `${component.height}px`,
    backgroundColor: component.bgColor,
    color: component.textColor,
    fontSize: `${component.fontSize}px`,
    borderRadius: `${component.borderRadius}px`,
    border: isSelected ? '3px solid #3b82f6' : component.isAI ? '2px dashed #8b5cf6' : '1px solid #d1d5db',
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    position: 'absolute' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 shadow-lg hover:shadow-xl transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${component.isAI ? 'border-dashed' : ''}`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium bg-black/10 px-2 py-1 rounded">
            {component.type}
          </span>
          {component.isAI && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              ✨ AI
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-500 hover:text-red-500 text-lg"
        >
          ×
        </button>
      </div>
      <div className="whitespace-pre-wrap">
        {component.content}
      </div>
      {component.aiPrompt && (
        <div className="mt-2 text-xs text-purple-600 opacity-80">
          AI: "{component.aiPrompt}"
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500 opacity-70">
        Drag to move • Click to select
      </div>
    </div>
  );
}

// Component Library
function ComponentLibrary({
  onAddComponent,
  onGenerateAI
}: {
  onAddComponent: (type: string) => void;
  onGenerateAI: (prompt: string) => Promise<void>;
}) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const componentTypes = [
    { type: 'text', label: 'Text Box', icon: '📝', color: 'bg-blue-100' },
    { type: 'button', label: 'Button', icon: '🔼', color: 'bg-green-100' },
    { type: 'card', label: 'Card', icon: '🃏', color: 'bg-purple-100' },
    { type: 'input', label: 'Input Field', icon: '⌨️', color: 'bg-yellow-100' },
  ];

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGenerateAI(aiPrompt);
      setAiPrompt('');
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-bold text-lg">Component Library</h3>
        <p className="text-sm text-gray-600">Add components to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {componentTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => onAddComponent(item.type)}
              className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-sm text-gray-500">Click to add</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t">
          <h4 className="font-bold mb-3">✨ AI Generator</h4>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe a component..."
            className="w-full h-28 p-3 border border-gray-300 rounded-lg mb-3"
          />
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
          >
            {isGenerating ? 'Generating...' : '✨ Generate with AI'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Properties Panel
function PropertiesPanel({
  selectedComponent,
  updateComponent
}: {
  selectedComponent: Component | null;
  updateComponent: (id: string, updates: Partial<Component>) => void;
}) {
  const [activeTab, setActiveTab] = useState('style');

  if (!selectedComponent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-gray-500">
        <div className="text-5xl mb-4">⚙️</div>
        <h3 className="text-lg font-medium mb-2">No Component Selected</h3>
        <p className="text-center">Click on a component to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-bold text-lg">Properties</h3>
        <p className="text-sm text-gray-600">{selectedComponent.type}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={selectedComponent.content}
              onChange={(e) => updateComponent(selectedComponent.id, { content: e.target.value })}
              className="w-full p-3 border rounded-lg"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <input
              type="color"
              value={selectedComponent.bgColor}
              onChange={(e) => updateComponent(selectedComponent.id, { bgColor: e.target.value })}
              className="w-full h-10 cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Text Color</label>
            <input
              type="color"
              value={selectedComponent.textColor}
              onChange={(e) => updateComponent(selectedComponent.id, { textColor: e.target.value })}
              className="w-full h-10 cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Font Size: {selectedComponent.fontSize}px</label>
            <input
              type="range"
              min="12"
              max="48"
              value={selectedComponent.fontSize}
              onChange={(e) => updateComponent(selectedComponent.id, { fontSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Builder Component
export default function BuilderPage() {
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
    }
  ]);

  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  const addComponent = useCallback((type: string) => {
    const newComponent: Component = {
      id: Date.now().toString(),
      type,
      content: type === 'button' ? 'Click Me' : 'Text Content',
      x: 50 + Math.random() * 500,
      y: 50 + Math.random() * 300,
      width: type === 'button' ? 140 : 350,
      height: type === 'button' ? 48 : 100,
      bgColor: type === 'button' ? '#3b82f6' : '#ffffff',
      textColor: type === 'button' ? '#ffffff' : '#000000',
      fontSize: type === 'button' ? 16 : 18,
      borderRadius: 8
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent);
  }, []);

  const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
    
    if (selectedComponent?.id === id) {
      setSelectedComponent(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedComponent]);

  const removeComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    const component = components.find(c => c.id === active.id);
    if (component) {
      updateComponent(component.id, {
        x: component.x + delta.x,
        y: component.y + delta.y
      });
    }
  };

  const handleGenerateAI = async (prompt: string) => {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiComponent = data.component;
        
        const newComponent: Component = {
          id: Date.now().toString(),
          type: aiComponent.type,
          content: aiComponent.content,
          x: 200,
          y: 200,
          width: 300,
          height: 150,
          bgColor: aiComponent.styles.backgroundColor,
          textColor: aiComponent.styles.color,
          fontSize: aiComponent.styles.fontSize,
          borderRadius: aiComponent.styles.borderRadius,
          isAI: true,
          aiPrompt: prompt
        };

        setComponents(prev => [...prev, newComponent]);
        setSelectedComponent(newComponent);
      }
    } catch (error) {
      // Fallback mock
      const newComponent: Component = {
        id: Date.now().toString(),
        type: 'card',
        content: `AI: ${prompt}`,
        x: 200,
        y: 200,
        width: 320,
        height: 180,
        bgColor: '#e0f2fe',
        textColor: '#0369a1',
        fontSize: 20,
        borderRadius: 16,
        isAI: true,
        aiPrompt: prompt
      };

      setComponents(prev => [...prev, newComponent]);
      setSelectedComponent(newComponent);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-lg border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏭 Meta Factory AI Builder</h1>
              <p className="text-gray-600">Phase 2 - AI Integration</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{components.length} components</span>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                📦 Export
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 bg-white border-r">
            <ComponentLibrary 
              onAddComponent={addComponent}
              onGenerateAI={handleGenerateAI}
            />
          </div>

          <div className="flex-1 relative overflow-auto bg-gray-100">
            <div className="absolute inset-0 p-8">
              {components.map((component) => (
                <DraggableComponent
                  key={component.id}
                  component={component}
                  isSelected={selectedComponent?.id === component.id}
                  onClick={() => setSelectedComponent(component)}
                  onDelete={() => removeComponent(component.id)}
                />
              ))}
            </div>
          </div>

          <div className="w-96 bg-white border-l">
            <PropertiesPanel 
              selectedComponent={selectedComponent}
              updateComponent={updateComponent}
            />
          </div>
        </div>
      </div>
    </DndContext>
  );
}
