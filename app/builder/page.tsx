"use client";

import { useState } from 'react';

export default function BuilderPage() {
  const [components, setComponents] = useState([
    { id: '1', content: 'Welcome! Drag me around', x: 100, y: 100 }
  ]);

  const addComponent = () => {
    const newComp = {
      id: Date.now().toString(),
      content: 'New Component',
      x: Math.random() * 400,
      y: Math.random() * 300
    };
    setComponents([...components, newComp]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🏭 Meta Factory Builder</h1>
          <div className="flex gap-4">
            <button 
              onClick={addComponent}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Component
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90">
              ✨ AI Generate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {/* Left Panel */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold mb-6">Components</h2>
            <div className="space-y-4">
              {['Text', 'Button', 'Input', 'Card', 'Container'].map((type) => (
                <div key={type} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  {type}
                </div>
              ))}
            </div>
          </div>

          {/* Main Canvas */}
          <div className="col-span-2 bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold mb-6">Canvas</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg h-[600px] relative">
              {components.map((comp) => (
                <div
                  key={comp.id}
                  style={{
                    position: 'absolute',
                    left: comp.x,
                    top: comp.y
                  }}
                  className="p-4 bg-white border rounded-lg shadow cursor-move"
                >
                  {comp.content}
                </div>
              ))}
              
              {components.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-xl">Empty Canvas</p>
                  <p className="text-gray-400 mt-2">Add components to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold mb-6">Properties</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <input className="w-full p-3 border rounded" placeholder="Enter text..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <input type="color" className="w-full h-10 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <input className="p-2 border rounded" placeholder="Width" />
                  <input className="p-2 border rounded" placeholder="Height" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
