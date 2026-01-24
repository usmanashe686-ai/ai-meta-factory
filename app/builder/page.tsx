"use client";

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { BuilderProvider, useBuilder } from '@/contexts/BuilderContext';
import DraggableComponent from '@/components/builder/DraggableComponent';
import ComponentLibrary from '@/components/builder/ComponentLibrary';
import PropertiesPanel from '@/components/builder/PropertiesPanel';

function BuilderContent() {
  const { 
    components, 
    selectedComponent, 
    addComponent, 
    updateComponent, 
    removeComponent, 
    selectComponent 
  } = useBuilder();

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
    // Mock AI generation for now
    const aiComponent = {
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
    selectComponent(aiComponent);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
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

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Component Library */}
          <div className="w-80 bg-white border-r shadow-inner">
            <ComponentLibrary 
              onAddComponent={addComponent}
              onGenerateAI={handleGenerateAI}
            />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-auto bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="absolute inset-0 p-8">
              {components.map((component) => (
                <DraggableComponent
                  key={component.id}
                  component={component}
                  isSelected={selectedComponent?.id === component.id}
                  onClick={() => selectComponent(component)}
                  onDelete={() => removeComponent(component.id)}
                />
              ))}
            </div>
            
            {/* Canvas Guide */}
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

          {/* Right Sidebar - Properties */}
          <div className="w-96 bg-white border-l shadow-inner">
            <PropertiesPanel />
          </div>
        </div>

        {/* Status Bar */}
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

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <BuilderContent />
    </BuilderProvider>
  );
}
