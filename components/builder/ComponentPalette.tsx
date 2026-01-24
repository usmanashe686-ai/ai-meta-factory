"use client";

import { Plus } from 'lucide-react';

const componentTemplates = [
  { type: 'container', label: 'Container', icon: '📦' },
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'button', label: 'Button', icon: '🔼' },
  { type: 'input', label: 'Input', icon: '⌨️' },
  { type: 'card', label: 'Card', icon: '🃏' },
  { type: 'navbar', label: 'Navbar', icon: '📋' },
];

interface ComponentPaletteProps {
  onAddComponent: (component: any) => void;
}

export default function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const handleAddComponent = (type: string) => {
    const baseComponents = {
      container: {
        type: 'container' as const,
        content: 'Container',
        position: { x: 100, y: 100 },
        styles: {
          padding: '20px',
          backgroundColor: '#f3f4f6',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          minHeight: '100px',
          minWidth: '200px'
        }
      },
      text: {
        type: 'text' as const,
        content: 'Sample Text',
        position: { x: 150, y: 150 },
        styles: {
          fontSize: '16px',
          color: '#374151',
          fontWeight: 'normal'
        }
      },
      button: {
        type: 'button' as const,
        content: 'Click Me',
        position: { x: 200, y: 200 },
        styles: {
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }
      },
      input: {
        type: 'input' as const,
        content: 'Input field',
        position: { x: 250, y: 250 },
        styles: {
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          width: '200px'
        }
      },
      card: {
        type: 'container' as const,
        content: 'Card Component',
        position: { x: 300, y: 300 },
        styles: {
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '300px'
        }
      }
    };

    onAddComponent(baseComponents[type as keyof typeof baseComponents] || baseComponents.container);
  };

  return (
    <div>
      <h3 className="font-semibold mb-4 text-gray-700">Components</h3>
      <div className="space-y-2">
        {componentTemplates.map((comp) => (
          <button
            key={comp.type}
            onClick={() => handleAddComponent(comp.type)}
            className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
          >
            <span className="text-xl">{comp.icon}</span>
            <span>{comp.label}</span>
            <Plus className="ml-auto h-4 w-4 text-gray-400" />
          </button>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="font-semibold mb-4 text-gray-700">AI Templates</h3>
        <div className="space-y-2">
          <button className="w-full p-3 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50">
            🛒 E-commerce Product Card
          </button>
          <button className="w-full p-3 border border-dashed border-green-300 rounded-lg text-green-600 hover:bg-green-50">
            📊 Analytics Dashboard
          </button>
          <button className="w-full p-3 border border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50">
            📝 Contact Form
          </button>
        </div>
      </div>
    </div>
  );
}
