"use client";

import { useState } from 'react';

type Component = {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  borderColor: string;
};

export default function BuilderPage() {
  const [components, setComponents] = useState<Component[]>([
    {
      id: 'demo-1',
      content: 'Welcome to Meta Factory AI Builder\n\nDrag me around!',
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      bgColor: '#ffffff',
      borderColor: '#3b82f6'
    }
  ]);
  
  const [selectedId, setSelectedId] = useState<string>('demo-1');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const addComponent = () => {
    const newComponent: Component = {
      id: `comp-${Date.now()}`,
      content: `Component ${components.length + 1}`,
      x: 100 + components.length * 50,
      y: 100 + components.length * 50,
      width: 250,
      height: 150,
      bgColor: '#f3f4f6',
      borderColor: '#d1d5db'
    };
    setComponents([...components, newComponent]);
    setSelectedId(newComponent.id);
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const removeComponent = (id: string) => {
    const newComponents = components.filter(comp => comp.id !== id);
    setComponents(newComponents);
    if (selectedId === id) {
      setSelectedId(newComponents.length > 0 ? newComponents[0].id : '');
    }
  };

  const handleMouseDown = (e: React.MouseEvent, componentId: string) => {
    e.preventDefault();
    setDraggingId(componentId);
    setSelectedId(componentId);
    
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    const offsetX = e.clientX - component.x;
    const offsetY = e.clientY - component.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  // Handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingId) return;

    const component = components.find(c => c.id === draggingId);
    if (!component) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    updateComponent(draggingId, { x: newX, y: newY });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // Add event listeners
  React.useEffect(() => {
    if (draggingId) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragOffset]);

  const selectedComponent = components.find(c => c.id === selectedId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏭 Meta Factory AI Builder</h1>
              <p className="text-gray-600 text-sm">Phase 0 - Real Working Builder</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addComponent}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + Add Component
              </button>
              <button className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                🎨 AI Generate
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="col-span-3 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-6">Components</h2>
            <div className="space-y-3">
              {components.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => setSelectedId(comp.id)}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedId === comp.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{comp.id}</div>
                  <div className="text-sm text-gray-500 truncate">{comp.content.substring(0, 30)}...</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{components.length}</div>
                <div className="text-sm text-gray-600">Components on Canvas</div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="col-span-6 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-6">Canvas</h2>
            <div className="border-3 border-dashed border-gray-300 rounded-xl h-[600px] relative bg-gray-50">
              {components.map((comp) => (
                <div
                  key={comp.id}
                  style={{
                    position: 'absolute',
                    left: comp.x,
                    top: comp.y,
                    width: comp.width,
                    height: comp.height,
                    backgroundColor: comp.bgColor,
                    border: `2px solid ${comp.borderColor}`,
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'move'
                  }}
                  className={`hover:shadow-lg transition-shadow ${
                    selectedId === comp.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                  onMouseDown={(e) => handleMouseDown(e, comp.id)}
                >
                  <div className="whitespace-pre-wrap">{comp.content}</div>
                  {selectedId === comp.id && (
                    <button
                      onClick={() => removeComponent(comp.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-3 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-6">Properties</h2>
            {selectedComponent ? (
              <div className="space-y-6">
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
                  <label className="block text-sm font-medium mb-2">Border Color</label>
                  <input
                    type="color"
                    value={selectedComponent.borderColor}
                    onChange={(e) => updateComponent(selectedComponent.id, { borderColor: e.target.value })}
                    className="w-full h-10 cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Width</label>
                      <input
                        type="number"
                        value={selectedComponent.width}
                        onChange={(e) => updateComponent(selectedComponent.id, { width: parseInt(e.target.value) || 100 })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Height</label>
                      <input
                        type="number"
                        value={selectedComponent.height}
                        onChange={(e) => updateComponent(selectedComponent.id, { height: parseInt(e.target.value) || 100 })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a component to edit
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <div className="bg-white border-t p-4 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto flex justify-between">
          <div>Ready - Drag components to move</div>
          <div>Phase 0 - Real Implementation</div>
        </div>
      </div>
    </div>
  );
}
