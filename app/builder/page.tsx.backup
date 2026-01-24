"use client";

import { useState } from 'react';
import { BuilderProvider, useBuilder } from '@/app/contexts/BuilderContext';
import { DndContext, DragEndEvent, closestCorners, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import ComponentPalette from '@/components/builder/ComponentPalette';
import CanvasComponent from '@/components/builder/CanvasComponent';
import AIPanel from '@/components/builder/AIPanel';
import PropertiesPanel from '@/components/builder/PropertiesPanel';

function BuilderContent() {
  const { components, addComponent, updateComponent, removeComponent, selectedComponent, setSelectedComponent } = useBuilder();
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      const activeComponent = components.find(c => c.id === active.id);
      if (activeComponent) {
        updateComponent(active.id as string, {
          position: {
            x: (over.rect?.left || 0) + (over.rect?.width || 0) / 2,
            y: (over.rect?.top || 0) + (over.rect?.height || 0) / 2
          }
        });
      }
    }
  };

  return (
    <BuilderProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Left Sidebar - Component Palette */}
        <div className="w-64 border-r bg-white p-4 overflow-auto">
          <ComponentPalette onAddComponent={addComponent} />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Header */}
          <div className="border-b bg-white p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Builder Canvas</h1>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (selectedComponent) {
                      removeComponent(selectedComponent);
                    }
                  }}
                  disabled={!selectedComponent}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setAiPanelOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
                >
                  Generate with AI
                </button>
              </div>
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 relative overflow-auto p-8">
            <div 
              className="min-h-full bg-white rounded-lg border-2 border-dashed border-gray-300 relative"
              onClick={() => setSelectedComponent(null)}
            >
              <DndContext 
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={components.map(c => c.id)}
                  strategy={rectSortingStrategy}
                >
                  {components.map((component) => (
                    <CanvasComponent 
                      key={component.id}
                      component={component}
                      isSelected={selectedComponent === component.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComponent(component.id);
                      }}
                      onDelete={() => removeComponent(component.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
              {components.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <div className="text-6xl mb-6">🎨</div>
                  <p className="text-xl font-medium mb-2">Canvas is empty</p>
                  <p className="text-sm text-gray-400 mb-6">Add components from the left panel or generate with AI</p>
                  <button
                    onClick={() => setAiPanelOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                  >
                    <span className="text-xl">✨</span>
                    Start with AI
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 border-l bg-white overflow-auto">
          <PropertiesPanel />
        </div>

        {/* AI Panel Modal */}
        {aiPanelOpen && (
          <AIPanel 
            onClose={() => setAiPanelOpen(false)}
            onGenerate={(code) => {
              addComponent({
                type: 'custom',
                content: 'AI Generated Component\n' + code.substring(0, 100) + '...',
                position: { x: 200, y: 200 },
                styles: {
                  padding: '24px',
                  backgroundColor: '#f0f9ff',
                  border: '2px dashed #7dd3fc',
                  borderRadius: '12px',
                  width: '350px',
                  minHeight: '200px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                },
                code
              });
              setAiPanelOpen(false);
            }}
          />
        )}
      </div>
    </BuilderProvider>
  );
}

export default function BuilderPage() {
  return <BuilderContent />;
}
