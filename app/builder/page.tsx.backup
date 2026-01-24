"use client";

import { useState } from 'react';

export default function BuilderPage() {
  const [components, setComponents] = useState([
    { id: '1', type: 'text', content: 'Welcome to Builder!', x: 100, y: 100, color: '#ffffff' }
  ]);
  const [selected, setSelected] = useState('1');

  const addComponent = (type: string) => {
    const id = Date.now().toString();
    let content = 'New Component';
    let color = '#ffffff';
    
    if (type === 'button') {
      content = 'Click Me';
      color = '#3b82f6';
    } else if (type === 'input') {
      content = 'Enter text...';
      color = '#f9fafb';
    } else if (type === 'card') {
      content = 'Card Title\nCard content goes here';
      color = '#ffffff';
    }
    
    const newComp = {
      id,
      type,
      content,
      x: 50 + Math.random() * 300,
      y: 50 + Math.random() * 200,
      color
    };
    setComponents([...components, newComp]);
    setSelected(id);
  };

  const deleteComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
    if (selected === id) setSelected('');
  };

  const updateComponent = (id: string, updates: any) => {
    setComponents(components.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const selectedComp = components.find(c => c.id === selected);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Components */}
      <div className="w-64 bg-white border-r p-4">
        <h2 className="font-bold text-lg mb-4">Components</h2>
        {['Text', 'Button', 'Input', 'Card'].map(type => (
          <button
            key={type}
            onClick={() => addComponent(type.toLowerCase())}
            className="w-full p-3 border rounded mb-2 hover:bg-gray-50"
          >
            {type}
          </button>
        ))}
        
        <div className="mt-8">
          <h3 className="font-bold mb-3">AI Templates</h3>
          <button 
            onClick={() => addComponent('card')}
            className="w-full p-3 border border-dashed border-blue-300 rounded text-blue-600 hover:bg-blue-50 mb-2"
          >
            🛒 Product Card
          </button>
          <button 
            onClick={() => addComponent('card')}
            className="w-full p-3 border border-dashed border-green-300 rounded text-green-600 hover:bg-green-50 mb-2"
          >
            📊 Dashboard
          </button>
        </div>
        
        <div className="mt-8">
          <button className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:opacity-90">
            ✨ AI Generate
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b">
          <h1 className="text-xl font-bold">Builder Canvas</h1>
          <div className="mt-2 flex gap-3">
            <button 
              onClick={() => selected && deleteComponent(selected)}
              disabled={!selected}
              className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
            >
              Delete Selected
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded">
              Export
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-8">
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-full relative">
            {components.map(comp => (
              <div
                key={comp.id}
                style={{
                  position: 'absolute',
                  left: comp.x,
                  top: comp.y,
                  backgroundColor: comp.color,
                  border: selected === comp.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  padding: '16px',
                  borderRadius: '8px',
                  cursor: 'move',
                  minWidth: '100px',
                  minHeight: '50px'
                }}
                onClick={() => setSelected(comp.id)}
                className="hover:shadow-md transition-shadow"
              >
                <div className="whitespace-pre-line">
                  {comp.content}
                </div>
                {selected === comp.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteComponent(comp.id);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
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
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 bg-white border-l p-4">
        <h2 className="font-bold text-lg mb-4">Properties</h2>
        
        {selectedComp ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={selectedComp.content}
                onChange={(e) => updateComponent(selectedComp.id, { content: e.target.value })}
                className="w-full p-3 border rounded"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-500">X</span>
                  <input
                    type="number"
                    value={selectedComp.x}
                    onChange={(e) => updateComponent(selectedComp.id, { x: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500">Y</span>
                  <input
                    type="number"
                    value={selectedComp.y}
                    onChange={(e) => updateComponent(selectedComp.id, { y: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <input
                type="color"
                value={selectedComp.color}
                onChange={(e) => updateComponent(selectedComp.id, { color: e.target.value })}
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
