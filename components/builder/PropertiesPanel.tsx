"use client";

import { useState } from 'react';
import { useBuilder } from '@/app/contexts/BuilderContext';
import { 
  Palette, Type, Layout, Box, Copy, Trash2, Move, 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Minus, Plus, Save
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'White', value: '#ffffff', textColor: '#000000' },
  { name: 'Light Gray', value: '#f3f4f6', textColor: '#000000' },
  { name: 'Blue', value: '#3b82f6', textColor: '#ffffff' },
  { name: 'Purple', value: '#8b5cf6', textColor: '#ffffff' },
  { name: 'Green', value: '#10b981', textColor: '#ffffff' },
  { name: 'Red', value: '#ef4444', textColor: '#ffffff' },
  { name: 'Yellow', value: '#f59e0b', textColor: '#000000' },
  { name: 'Dark', value: '#1f2937', textColor: '#ffffff' },
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
const PADDING_OPTIONS = ['4px', '8px', '12px', '16px', '20px', '24px', '32px', '48px'];
const BORDER_RADIUS = ['0px', '4px', '8px', '12px', '16px', '24px', '9999px'];

export default function PropertiesPanel() {
  const { selectedComponent, components, updateComponent, duplicateComponent } = useBuilder();
  const [customCSS, setCustomCSS] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const component = components.find(c => c.id === selectedComponent);

  if (!component) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <Box className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Component Selected</h3>
        <p className="text-gray-500 text-sm">
          Click on any component in the canvas to edit its properties
        </p>
      </div>
    );
  }

  const updateStyle = (property: string, value: string) => {
    updateComponent(component.id, {
      styles: { ...component.styles, [property]: value }
    });
  };

  const handleCustomCSSUpdate = () => {
    if (!customCSS.trim()) return;
    
    const styles: Record<string, string> = {};
    const lines = customCSS.split('\n');
    
    lines.forEach(line => {
      const [property, ...valueParts] = line.split(':');
      if (property && valueParts.length > 0) {
        const value = valueParts.join(':').trim().replace(';', '');
        styles[property.trim()] = value;
      }
    });
    
    updateComponent(component.id, {
      styles: { ...component.styles, ...styles }
    });
    
    setCustomCSS('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Properties</h2>
            <p className="text-sm text-gray-500 capitalize">{component.type} Component</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => duplicateComponent(component.id)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Duplicate"
            >
              <Copy className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Component Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Box className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 capitalize">{component.type}</div>
                <div className="text-xs text-gray-500 font-mono">ID: {component.id.substring(0, 8)}...</div>
              </div>
            </div>
            <div className="text-xs bg-white px-2 py-1 rounded text-gray-600">
              Position: {Math.round(component.position.x)}px, {Math.round(component.position.y)}px
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type className="h-4 w-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-900">Content</label>
          </div>
          <textarea
            value={component.content}
            onChange={(e) => updateComponent(component.id, { content: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Enter component content..."
          />
          
          {/* Text Formatting */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => updateStyle('fontWeight', component.styles.fontWeight === 'bold' ? 'normal' : 'bold')}
              className={\`p-2 rounded \${component.styles.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => updateStyle('fontStyle', component.styles.fontStyle === 'italic' ? 'normal' : 'italic')}
              className={\`p-2 rounded \${component.styles.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}
            >
              <Italic className="h-4 w-4" />
            </button>
            <div className="flex-1"></div>
            <button
              onClick={() => updateStyle('textAlign', 'left')}
              className={\`p-2 rounded \${component.styles.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => updateStyle('textAlign', 'center')}
              className={\`p-2 rounded \${component.styles.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              onClick={() => updateStyle('textAlign', 'right')}
              className={\`p-2 rounded \${component.styles.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}
            >
              <AlignRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-900">Background Color</label>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.value}
                onClick={() => updateStyle('backgroundColor', color.value)}
                className={\`h-10 rounded-lg border-2 transition-all \${component.styles.backgroundColor === color.value ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-105'}\`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={component.styles.backgroundColor || '#ffffff'}
              onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              className="w-12 h-12 cursor-pointer rounded-lg border"
            />
            <input
              type="text"
              value={component.styles.backgroundColor || '#ffffff'}
              onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              className="flex-1 p-2 border rounded-lg font-mono text-sm"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Font Size</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const current = parseInt(component.styles.fontSize) || 16;
                updateStyle('fontSize', \`\${Math.max(8, current - 2)}px\`);
              }}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Minus className="h-4 w-4" />
            </button>
            
            <select
              value={component.styles.fontSize || '16px'}
              onChange={(e) => updateStyle('fontSize', e.target.value)}
              className="flex-1 p-2 border rounded-lg"
            >
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                const current = parseInt(component.styles.fontSize) || 16;
                updateStyle('fontSize', \`\${current + 2}px\`);
              }}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Padding & Spacing */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layout className="h-4 w-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-900">Spacing</label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Padding</label>
              <select
                value={component.styles.padding || '16px'}
                onChange={(e) => updateStyle('padding', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                {PADDING_OPTIONS.map(padding => (
                  <option key={padding} value={padding}>{padding}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Border Radius</label>
              <select
                value={component.styles.borderRadius || '8px'}
                onChange={(e) => updateStyle('borderRadius', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                {BORDER_RADIUS.map(radius => (
                  <option key={radius} value={radius}>{radius}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Position Controls */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Position</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">X Position</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={component.position.x}
                  onChange={(e) => updateComponent(component.id, {
                    position: { ...component.position, x: parseInt(e.target.value) || 0 }
                  })}
                  className="flex-1 p-2 border rounded-lg"
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => updateComponent(component.id, {
                      position: { ...component.position, x: component.position.x - 10 }
                    })}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => updateComponent(component.id, {
                      position: { ...component.position, x: component.position.x + 10 }
                    })}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Y Position</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={component.position.y}
                  onChange={(e) => updateComponent(component.id, {
                    position: { ...component.position, y: parseInt(e.target.value) || 0 }
                  })}
                  className="flex-1 p-2 border rounded-lg"
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => updateComponent(component.id, {
                      position: { ...component.position, y: component.position.y - 10 }
                    })}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => updateComponent(component.id, {
                      position: { ...component.position, y: component.position.y + 10 }
                    })}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced CSS Editor */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
          >
            <span className="text-sm font-medium text-gray-900">Advanced CSS Editor</span>
            <span className="text-gray-500">{showAdvanced ? '▲' : '▼'}</span>
          </button>
          
          {showAdvanced && (
            <div className="mt-3 space-y-3">
              <textarea
                value={customCSS}
                onChange={(e) => setCustomCSS(e.target.value)}
                placeholder={\`Enter custom CSS properties:
background: linear-gradient(...);
transform: rotate(5deg);
animation: pulse 2s infinite;
\`}
                className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
              />
              <button
                onClick={handleCustomCSSUpdate}
                className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                Apply Custom CSS
              </button>
              
              {/* Current Styles Preview */}
              <div className="border rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-2">Current Styles:</div>
                <div className="font-mono text-xs max-h-24 overflow-y-auto">
                  {Object.entries(component.styles).map(([key, value]) => (
                    <div key={key} className="text-gray-700">
                      {key}: {value};
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <button
          onClick={() => {
            const stylesStr = Object.entries(component.styles)
              .map(([key, value]) => \`\${key}: \${value};\`)
              .join('\\n');
            navigator.clipboard.writeText(stylesStr);
          }}
          className="w-full p-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy All Styles
        </button>
      </div>
    </div>
  );
}
