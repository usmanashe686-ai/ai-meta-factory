"use client";

import { useState } from 'react';

export default function BuilderPage() {
  const [components, setComponents] = useState<any[]>([
    {
      id: 'welcome',
      type: 'container',
      content: 'Welcome to Meta Factory Builder',
      styles: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'absolute',
        left: '100px',
        top: '100px'
      }
    }
  ]);
  
  const handleAddComponent = () => {
    const newComponent = {
      id: `comp-${Date.now()}`,
      type: 'card',
      content: 'New Component',
      styles: {
        padding: '20px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        position: 'absolute',
        left: `${Math.random() * 500}px`,
        top: `${Math.random() * 500}px`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '200px'
      }
    };
    setComponents([...components, newComponent]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="p-4 border-b bg-white">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Builder</h1>
          <button 
            onClick={handleAddComponent}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
          >
            Add Component
          </button>
        </div>
      </header>
      <div className="flex-1 relative overflow-auto p-8">
        <div className="min-h-full bg-white rounded-lg border-2 border-dashed border-gray-300 relative">
          {components.map(comp => (
            <div 
              key={comp.id} 
              style={comp.styles}
              className="cursor-move"
            >
              {comp.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
