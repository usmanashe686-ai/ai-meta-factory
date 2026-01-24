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
    border: isSelected ? '3px solid #3b82f6' : '1px solid #d1d5db',
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
      }`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium bg-black/10 px-2 py-1 rounded">
          {component.type}
        </span>
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
  onGenerateAI: (prompt: string) => void;
}) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const componentTypes = [
    { type: 'text', label: 'Text Box', icon: '📝', color: 'bg-blue-100' },
    { type: 'button', label: 'Button', icon: '🔼', color: 'bg-green-100' },
    { type: 'card', label: 'Card', icon: '🃏', color: 'bg-purple-100' },
    { type: 'input', label: 'Input Field', icon: '⌨️', color: 'bg-yellow-100' },
    { type: 'image', label: 'Image', icon: '🖼️', color: 'bg-pink-100' },
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
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <span>✨</span> AI Generator
          </h4>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe a component..."
            className="w-full h-28 p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating || !aiPrompt.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
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
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Properties</h3>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {selectedComponent.type}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Editing: {selectedComponent.id}</p>
      </div>

      <div className="flex border-b">
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'style' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text Content</label>
              <textarea
                value={selectedComponent.content}
                onChange={(e) => updateComponent(selectedComponent.id, { content: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Font Size (px)</label>
              <input
                type="range"
                min="12"
                max="48"
                value={selectedComponent.fontSize}
                onChange={(e) => updateComponent(selectedComponent.id, { fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {selectedComponent.fontSize}px
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <input
                type="color"
                value={selectedComponent.bgColor}
                onChange={(e) => updateComponent(selectedComponent.id, { bgColor: e.target.value })}
                className="w-full h-12 cursor-pointer rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <input
                type="color"
                value={selectedComponent.textColor}
                onChange={(e) => updateComponent(selectedComponent.id, { textColor: e.target.value })}
                className="w-full h-12 cursor-pointer rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Border Radius (px)</label>
              <input
                type="range"
                min="0"
                max="24"
                value={selectedComponent.borderRadius}
                onChange={(e) => updateComponent(selectedComponent.id, { borderRadius: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {selectedComponent.borderRadius}px
              </div>
            </div>
          </div>
        )}
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

  const addComponent = useCallback((type: string) => {
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
    const aiComponent: Component = {
      id: Date.now().toString(),
      type: 'card',
      content: `AI Generated: ${prompt}`,
      x: 200,
      y: 200,
      width: 320,
      height: 180,
      bgColor: '#e0f2fe',
      textColor: '#0369a1',
      fontSize: 20,
      borderRadius: 16
    };

    updateComponent(aiComponent.id, aiComponent);
    setSelectedComponent(aiComponent);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-lg border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-3xl">🏭</span>
                <div>
                  <div>Meta Factory AI Builder</div>
                  <div className="text-sm font-normal text-gray-600">
                    Phase 1 - Real Drag & Drop
                  </div>
                </div>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{components.length}</span> components
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                📦 Export
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                🚀 Deploy
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 bg-white border-r shadow-inner">
            <ComponentLibrary 
              onAddComponent={addComponent}
              onGenerateAI={handleGenerateAI}
            />
          </div>

          <div className="flex-1 relative overflow-auto bg-gradient-to-br from-gray-100 to-gray-200">
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
            
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-sm text-gray-600">
                <div className="font-medium">Canvas Guide</div>
                <div className="mt-2 space-y-1 text-xs">
                  <div>• Click to select components</div>
                  <div>• Drag to move components</div>
                  <div>• Edit properties on the right</div>
                  <div>• Use AI generator on the left</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-96 bg-white border-l shadow-inner">
            <PropertiesPanel 
              selectedComponent={selectedComponent}
              updateComponent={updateComponent}
            />
          </div>
        </div>

        <footer className="bg-white border-t px-6 py-3">
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-600">
              <span className="font-medium">Status:</span> Drag & Drop Active
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Phase 1 Complete</span>
            </div>
          </div>
        </footer>
      </div>
    </DndContext>
  );
}
