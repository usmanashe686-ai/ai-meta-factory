"use client";

import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, closestCenter, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Draggable Component
function DraggableComponent({
  component,
  isSelected,
  onClick,
  onDelete
}: {
  component: any;
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
    border: isSelected ? '3px solid #3b82f6' : '1px solid #d1d5db',
    borderRadius: `${component.borderRadius}px`,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    position: 'absolute' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 shadow-lg hover:shadow-xl transition-shadow"
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
      <div>{component.content}</div>
      <div className="mt-2 text-xs text-gray-500 opacity-70">
        Drag to move
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const [components, setComponents] = useState([
    {
      id: '1',
      type: 'text',
      content: 'Welcome to Meta Factory',
      x: 100,
      y: 100,
      width: 300,
      height: 80,
      bgColor: '#ffffff',
      textColor: '#000000',
      borderRadius: 8
    },
    {
      id: '2',
      type: 'button',
      content: 'Click Me',
      x: 150,
      y: 200,
      width: 120,
      height: 40,
      bgColor: '#3b82f6',
      textColor: '#ffffff',
      borderRadius: 8
    },
    {
      id: '3',
      type: 'card',
      content: 'AI Generated Card',
      x: 300,
      y: 150,
      width: 250,
      height: 150,
      bgColor: '#f8fafc',
      textColor: '#334155',
      borderRadius: 12
    }
  ]);

  const [selectedId, setSelectedId] = useState<string>('1');
  const [aiPrompt, setAiPrompt] = useState('');

  const addComponent = useCallback((type: string) => {
    const newComponent = {
      id: Date.now().toString(),
      type,
      content: type === 'button' ? 'Click Me' : 
               type === 'card' ? 'Card Content' : 'Text Content',
      x: 50 + Math.random() * 500,
      y: 50 + Math.random() * 300,
      width: type === 'button' ? 120 : 
             type === 'card' ? 250 : 300,
      height: type === 'button' ? 40 : 
              type === 'card' ? 150 : 100,
      bgColor: type === 'button' ? '#3b82f6' : 
               type === 'card' ? '#f8fafc' : '#ffffff',
      textColor: type === 'button' ? '#ffffff' : '#000000',
      borderRadius: 8
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedId(newComponent.id);
  }, []);

  const updateComponent = useCallback((id: string, updates: any) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedId === id) {
      setSelectedId(components.length > 1 ? components[0].id : '');
    }
  }, [selectedId, components]);

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

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) return;
    
    const aiComponent = {
      id: Date.now().toString(),
      type: 'card',
      content: `AI: ${aiPrompt}`,
      x: 200,
      y: 200,
      width: 320,
      height: 180,
      bgColor: '#e0f2fe',
      textColor: '#0369a1',
      borderRadius: 16
    };

    setComponents(prev => [...prev, aiComponent]);
    setSelectedId(aiComponent.id);
    setAiPrompt('');
  };

  const selectedComponent = components.find(c => c.id === selectedId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏭 Meta Factory AI Builder</h1>
              <p className="text-gray-600">Phase 3 - Drag & Drop Added</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {components.length} components
              </span>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                📦 Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="col-span-3 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-6">Component Library</h2>
            <div className="space-y-3">
              {['text', 'button', 'card', 'input'].map((type) => (
                <button
                  key={type}
                  onClick={() => addComponent(type)}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium capitalize">{type}</div>
                  <div className="text-sm text-gray-500">Click to add</div>
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-bold mb-3">✨ AI Generator</h3>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe a component..."
                className="w-full h-24 p-3 border rounded-lg mb-3"
              />
              <button
                onClick={handleGenerateAI}
                className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
              >
                Generate with AI
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="col-span-6 bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Canvas</h2>
              <div className="text-sm text-gray-500">
                Drag components to move them
              </div>
            </div>
            
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="border-2 border-dashed border-gray-300 rounded-xl h-[500px] relative">
                {components.map((component) => (
                  <DraggableComponent
                    key={component.id}
                    component={component}
                    isSelected={selectedId === component.id}
                    onClick={() => setSelectedId(component.id)}
                    onDelete={() => removeComponent(component.id)}
                  />
                ))}
              </div>
            </DndContext>
          </div>

          {/* Right Panel */}
          <div className="col-span-3 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-6">Properties</h2>
            {selectedComponent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <input
                    type="text"
                    value={selectedComponent.content}
                    onChange={(e) => updateComponent(selectedComponent.id, { content: e.target.value })}
                    className="w-full p-3 border rounded-lg"
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
                <button className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a component to edit
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <span className="font-medium">Status:</span> Drag & Drop Active
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Phase 3 Complete</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
