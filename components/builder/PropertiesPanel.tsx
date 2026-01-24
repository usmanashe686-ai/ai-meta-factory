"use client";

import { useBuilder } from '@/app/contexts/BuilderContext';
import { Palette, Type, Layout, Box } from 'lucide-react';

export default function PropertiesPanel() {
  const { selectedComponent, components, updateComponent } = useBuilder();
  
  const component = components.find(c => c.id === selectedComponent);

  if (!component) {
    return (
      <div className="p-6">
        <h3 className="font-semibold mb-4 text-gray-700">Properties</h3>
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select a component to edit properties</p>
        </div>
      </div>
    );
  }

  const updateStyle = (property: string, value: string) => {
    updateComponent(component.id, {
      styles: { ...component.styles, [property]: value }
    });
  };

  const colorOptions = [
    { label: 'White', value: '#ffffff' },
    { label: 'Gray', value: '#f3f4f6' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Green', value: '#10b981' },
  ];

  return (
    <div className="p-6">
      <h3 className="font-semibold mb-4 text-gray-700">Properties</h3>
      
      <div className="space-y-6">
        {/* Component Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white rounded">
              <Box className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium">{component.type.charAt(0).toUpperCase() + component.type.slice(1)}</p>
              <p className="text-sm text-gray-500">ID: {component.id.substring(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type className="h-4 w-4 text-gray-600" />
            <label className="text-sm font-medium">Content</label>
          </div>
          <textarea
            value={component.content}
            onChange={(e) => updateComponent(component.id, { content: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Color Picker */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-gray-600" />
            <label className="text-sm font-medium">Background Color</label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => updateStyle('backgroundColor', color.value)}
                className={`h-8 rounded border ${component.styles.backgroundColor === color.value ? 'ring-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
          <input
            type="color"
            value={component.styles.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            className="w-full mt-2 h-8 cursor-pointer"
          />
        </div>

        {/* Padding */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layout className="h-4 w-4 text-gray-600" />
            <label className="text-sm font-medium">Padding</label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['8px', '16px', '24px', '32px'].map((padding) => (
              <button
                key={padding}
                onClick={() => updateStyle('padding', padding)}
                className={`p-2 text-sm border rounded ${
                  component.styles.padding === padding ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
                }`}
              >
                {padding}
              </button>
            ))}
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium mb-3">Position</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">X</label>
              <input
                type="number"
                value={component.position.x}
                onChange={(e) => updateComponent(component.id, {
                  position: { ...component.position, x: parseInt(e.target.value) || 0 }
                })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Y</label>
              <input
                type="number"
                value={component.position.y}
                onChange={(e) => updateComponent(component.id, {
                  position: { ...component.position, y: parseInt(e.target.value) || 0 }
                })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Additional Styles */}
        <div>
          <label className="block text-sm font-medium mb-3">Custom CSS</label>
          <textarea
            value={Object.entries(component.styles)
              .filter(([key]) => !['position', 'left', 'top'].includes(key))
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n')}
            onChange={(e) => {
              const styles: Record<string, string> = {};
              e.target.value.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length) {
                  styles[key.trim()] = valueParts.join(':').replace(';', '').trim();
                }
              });
              updateComponent(component.id, { styles });
            }}
            className="w-full h-24 p-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="fontSize: 16px;
color: #374151;
borderRadius: 8px;"
          />
        </div>
      </div>
    </div>
  );
}
