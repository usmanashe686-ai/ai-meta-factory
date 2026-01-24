"use client";

import { useState } from 'react';

type Component = {
  id: string;
  type: string;
  content: string;
  x: number;
  y: number;
  color: string;
};

export default function BuilderPage() {
  const [components, setComponents] = useState<Component[]>([
    { 
      id: '1', 
      type: 'text', 
      content: 'Welcome to Meta Factory!', 
      x: 100, 
      y: 100, 
      color: '#ffffff' 
    }
  ]);
  
  const [selected, setSelected] = useState<string>('1');

  const addComponent = (type: string) => {
    const newComponent: Component = {
      id: Date.now().toString(),
      type,
      content: type === 'button' ? 'Click Me' : 
               type === 'input' ? 'Enter text...' : 
               'New Component',
      x: 50 + Math.random() * 400,
      y: 50 + Math.random() * 300,
      color: type === 'button' ? '#3b82f6' : '#ffffff'
    };
    
    setComponents([...components, newComponent]);
    setSelected(newComponent.id);
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const deleteComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
    if (selected === id) setSelected('');
  };

  const selectedComponent = components.find(comp => comp.id === selected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-xl shadow">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🏭 Meta Factory AI Builder
            </h1>
            <p className="text-gray-600 mt-2">Drag, drop, and build with AI</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => addComponent('card')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Add Component
            </button>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 font-medium"
            >
              ✨ Generate with AI
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Components */}
          <div className="col-span-3 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Components</h2>
            <div className="space-y-3">
              {[
                { type: 'text', label: 'Text', emoji: '📝' },
                { type: 'button', label: 'Button', emoji: '🔼' },
                { type: 'input', label: 'Input', emoji: '⌨️' },
                { type: 'card', label: 'Card', emoji: '🃏' },
                { type: 'container', label: 'Container', emoji: '📦' },
                { type: 'header', label: 'Header', emoji: '📋' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => addComponent(item.type)}
                  className="w-full flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-all hover:scale-[1.02]"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{components.length}</div>
                  <div className="text-sm text-gray-600">Components</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selected ? '1' : '0'}</div>
                  <div className="text-sm text-gray-600">Selected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Canvas */}
          <div className="col-span-6 flex flex-col">
            <div className="bg-white rounded-xl shadow flex-1 p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Canvas</h2>
              <div 
                className="border-3 border-dashed border-gray-300 rounded-xl h-[600px] relative bg-gradient-to-br from-white to-gray-50"
                onClick={() => setSelected('')}
              >
                {components.map((component) => (
                  <div
                    key={component.id}
                    style={{
                      position: 'absolute',
                      left: component.x,
                      top: component.y,
                      backgroundColor: component.color,
                      border: selected === component.id ? '3px solid #3b82f6' : '1px solid #e5e7eb',
                      boxShadow: selected === component.id ? '0 8px 24px rgba(59, 130, 246, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    className="p-6 rounded-lg cursor-move transition-all hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(component.id);
                    }}
                  >
                    <div className="font-medium">{component.content}</div>
                    {selected === component.id && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteComponent(component.id);
                          }}
                          className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateComponent(component.id, {
                              x: component.x + 10,
                              y: component.y + 10
                            });
                          }}
                          className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Move
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {components.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <div className="text-8xl mb-6">🎨</div>
                    <h3 className="text-2xl font-bold mb-2">Empty Canvas</h3>
                    <p className="text-gray-500">Add components to start building</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="col-span-3 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Properties</h2>
            
            {selectedComponent ? (
              <div className="space-y-6">
                {/* Component Type */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-medium">{selectedComponent.type}</div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={selectedComponent.content}
                    onChange={(e) => updateComponent(selectedComponent.id, { content: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <input
                    type="color"
                    value={selectedComponent.color}
                    onChange={(e) => updateComponent(selectedComponent.id, { color: e.target.value })}
                    className="w-full h-10 cursor-pointer rounded"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium mb-2">Position</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">X</label>
                      <input
                        type="number"
                        value={selectedComponent.x}
                        onChange={(e) => updateComponent(selectedComponent.id, { x: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Y</label>
                      <input
                        type="number"
                        value={selectedComponent.y}
                        onChange={(e) => updateComponent(selectedComponent.id, { y: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Colors */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quick Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ffffff'].map(color => (
                      <button
                        key={color}
                        onClick={() => updateComponent(selectedComponent.id, { color })}
                        style={{ backgroundColor: color }}
                        className="w-8 h-8 rounded border hover:scale-110 transition"
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-gray-500">Select a component</p>
                <p className="text-sm text-gray-400 mt-2">Click on any component in the canvas</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Drag components around • Click to select • Edit properties on the right</p>
        </div>
      </div>
    </div>
  );
}
