"use client";

import { useState } from 'react';

interface Component {
  id: string;
  type: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export default function CleanBuilderPage() {
  const [components, setComponents] = useState<Component[]>([
    {
      id: 'welcome',
      type: 'container',
      content: 'Welcome to Builder!',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      color: '#ffffff'
    }
  ]);
  
  const [selectedId, setSelectedId] = useState<string | null>('welcome');

  const addComponent = (type: string) => {
    const newComponent: Component = {
      id: `comp-${Date.now()}`,
      type,
      content: type === 'text' ? 'Sample Text' : 
               type === 'button' ? 'Click Me' : 
               type === 'input' ? 'Enter text...' : 'Component',
      x: 50 + Math.random() * 300,
      y: 50 + Math.random() * 200,
      width: type === 'input' ? 200 : 150,
      height: type === 'input' ? 40 : type === 'button' ? 50 : 100,
      color: type === 'button' ? '#3b82f6' : '#ffffff'
    };
    setComponents([...components, newComponent]);
    setSelectedId(newComponent.id);
  };

  const deleteComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const selectedComponent = components.find(c => c.id === selectedId);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Components */}
      <div className="w-64 bg-white border-r p-4">
        <h2 className="font-bold text-lg mb-4">Components</h2>
        <div className="space-y-2">
          {['Container', 'Text', 'Button', 'Input', 'Card'].map((type) => (
            <button
              key={type}
              onClick={() => addComponent(type.toLowerCase())}
              className="w-full p-3 border rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <span>{getIcon(type)}</span>
              <span>{type}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-8">
          <h3 className="font-bold mb-3">AI Templates</h3>
          <button 
            onClick={() => addComponent('card')}
            className="w-full p-3 border border-dashed border-blue-300 rounded text-blue-600 hover:bg-blue-50 mb-2"
          >
            🛒 E-commerce Card
          </button>
          <button 
            onClick={() => addComponent('container')}
            className="w-full p-3 border border-dashed border-green-300 rounded text-green-600 hover:bg-green-50 mb-2"
          >
            📊 Dashboard Widget
          </button>
          <button 
            onClick={() => addComponent('container')}
            className="w-full p-3 border border-dashed border-purple-300 rounded text-purple-600 hover:bg-purple-50"
          >
            📝 Contact Form
          </button>
        </div>
        
        <div className="mt-8">
          <button className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:opacity-90">
            ✨ Generate with AI
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b">
          <h1 className="text-xl font-bold">Builder Canvas</h1>
          <div className="mt-2 flex gap-3">
            <button 
              onClick={() => selectedId && deleteComponent(selectedId)}
              disabled={!selectedId}
              className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
            >
              Delete Selected
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded">
              Export Code
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative overflow-auto p-8">
          <div className="relative bg-white border-2 border-dashed border-gray-300 rounded min-h-full">
            {components.map((comp) => (
              <div
                key={comp.id}
                style={{
                  position: 'absolute',
                  left: comp.x,
                  top: comp.y,
                  width: comp.width,
                  height: comp.height,
                  backgroundColor: comp.color,
                  border: selectedId === comp.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'move'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(comp.id);
                }}
                className="hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  {comp.content}
                </div>
                {selectedId === comp.id && (
                  <div className="absolute -top-2 -right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteComponent(comp.id);
                      }}
                      className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {components.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-xl mb-2">Canvas is empty</p>
                <p className="text-gray-400">Add components from the left panel</p>
              </div>
            )}
            
            <div 
              className="absolute inset-0"
              onClick={() => setSelectedId(null)}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 bg-white border-l p-4">
        <h2 className="font-bold text-lg mb-4">Properties</h2>
        
        {selectedComponent ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <input
                type="text"
                value={selectedComponent.content}
                onChange={(e) => updateComponent(selectedComponent.id, { content: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-500">X</span>
                  <input
                    type="number"
                    value={selectedComponent.x}
                    onChange={(e) => updateComponent(selectedComponent.id, { x: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500">Y</span>
                  <input
                    type="number"
                    value={selectedComponent.y}
                    onChange={(e) => updateComponent(selectedComponent.id, { y: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-500">Width</span>
                  <input
                    type="number"
                    value={selectedComponent.width}
                    onChange={(e) => updateComponent(selectedComponent.id, { width: parseInt(e.target.value) || 100 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500">Height</span>
                  <input
                    type="number"
                    value={selectedComponent.height}
                    onChange={(e) => updateComponent(selectedComponent.id, { height: parseInt(e.target.value) || 100 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <input
                type="color"
                value={selectedComponent.color}
                onChange={(e) => updateComponent(selectedComponent.id, { color: e.target.value })}
                className="w-full h-10 cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            <div className="text-4xl mb-4">📦</div>
            <p>Select a component to edit properties</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getIcon(type: string) {
  switch(type.toLowerCase()) {
    case 'container': return '📦';
    case 'text': return '📝';
    case 'button': return '🔼';
    case 'input': return '⌨️';
    case 'card': return '🃏';
    default: return '📦';
  }
}
