"use client";

import { useBuilder } from '@/app/contexts/BuilderContext';
import { Plus, Copy, Sparkles } from 'lucide-react';
import { useState } from 'react';

const COMPONENT_TEMPLATES = [
  { 
    type: 'container' as const, 
    label: 'Container', 
    icon: '📦',
    description: 'Flexible container for grouping components',
    defaultStyles: {
      padding: '24px',
      backgroundColor: '#f8fafc',
      border: '2px dashed #cbd5e1',
      borderRadius: '12px',
      minWidth: '300px',
      minHeight: '200px'
    }
  },
  { 
    type: 'text' as const, 
    label: 'Text', 
    icon: '📝',
    description: 'Text content with formatting',
    defaultStyles: {
      fontSize: '16px',
      color: '#1f2937',
      fontWeight: 'normal',
      lineHeight: '1.5',
      padding: '12px'
    }
  },
  { 
    type: 'button' as const, 
    label: 'Button', 
    icon: '🔼',
    description: 'Interactive button with hover effects',
    defaultStyles: {
      padding: '12px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      width: 'fit-content'
    }
  },
  { 
    type: 'input' as const, 
    label: 'Input', 
    icon: '⌨️',
    description: 'Text input field',
    defaultStyles: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: 'white',
      width: '250px',
      fontSize: '14px'
    }
  },
  { 
    type: 'card' as const, 
    label: 'Card', 
    icon: '🃏',
    description: 'Content card with shadow',
    defaultStyles: {
      padding: '24px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      width: '300px',
      minHeight: '150px'
    }
  },
  { 
    type: 'navbar' as const, 
    label: 'Navbar', 
    icon: '📋',
    description: 'Navigation bar',
    defaultStyles: {
      padding: '16px 24px',
      backgroundColor: '#1f2937',
      color: 'white',
      width: '100%',
      minHeight: '64px',
      display: 'flex',
      alignItems: 'center'
    }
  }
];

const AI_TEMPLATES = [
  {
    label: 'User Profile Card',
    prompt: 'Create a user profile card with avatar, name, bio, and social links',
    icon: '👤',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    label: 'Product Card',
    prompt: 'Design an e-commerce product card with image, title, price, and add to cart button',
    icon: '🛒',
    color: 'from-green-500 to-emerald-500'
  },
  {
    label: 'Contact Form',
    prompt: 'Build a modern contact form with name, email, message fields, and submit button',
    icon: '📝',
    color: 'from-purple-500 to-pink-500'
  },
  {
    label: 'Dashboard Stats',
    prompt: 'Create a dashboard statistics card with icon, metric, trend indicator, and description',
    icon: '📊',
    color: 'from-orange-500 to-red-500'
  }
];

export default function ComponentPalette({ onAITemplateClick }: { onAITemplateClick: (prompt: string) => void }) {
  const { addComponent, duplicateComponent, selectedComponent } = useBuilder();
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const handleAddComponent = (template: typeof COMPONENT_TEMPLATES[0]) => {
    addComponent({
      type: template.type,
      content: template.label,
      position: { x: 100 + Math.random() * 400, y: 100 + Math.random() * 300 },
      styles: template.defaultStyles
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-gray-800">Component Library</h2>
        <p className="text-sm text-gray-500 mt-1">Drag & drop or click to add</p>
      </div>

      {/* Basic Components */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-4 bg-blue-600 rounded-full"></div>
            <h3 className="font-medium text-gray-700">Basic Components</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {COMPONENT_TEMPLATES.map((template) => (
              <button
                key={template.type}
                onClick={() => handleAddComponent(template)}
                onMouseEnter={() => setHoveredTemplate(template.type)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{template.label}</div>
                    <div className="text-xs text-gray-500 truncate">{template.description}</div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Templates */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-4 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
            <h3 className="font-medium text-gray-700">AI Templates</h3>
            <Sparkles className="w-4 h-4 text-purple-500 ml-auto" />
          </div>
          
          <div className="space-y-3">
            {AI_TEMPLATES.map((template) => (
              <button
                key={template.label}
                onClick={() => onAITemplateClick(template.prompt)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all text-left group bg-gradient-to-r from-white to-white hover:from-white hover:to-purple-50"
              >
                <div className="flex items-center gap-3">
                  <div className={\`p-2 rounded-lg bg-gradient-to-r \${template.color}\`}>
                    <span className="text-xl">{template.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{template.label}</div>
                    <div className="text-sm text-gray-500 truncate">{template.prompt}</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded">
                      AI
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Duplicate Selected */}
        {selectedComponent && (
          <div className="mt-8">
            <button
              onClick={() => duplicateComponent(selectedComponent)}
              className="w-full p-3 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate Selected Component
            </button>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between text-sm">
          <div>
            <div className="font-medium">{COMPONENT_TEMPLATES.length}</div>
            <div className="text-gray-500">Components</div>
          </div>
          <div>
            <div className="font-medium">{AI_TEMPLATES.length}</div>
            <div className="text-gray-500">AI Templates</div>
          </div>
        </div>
      </div>
    </div>
  );
}
