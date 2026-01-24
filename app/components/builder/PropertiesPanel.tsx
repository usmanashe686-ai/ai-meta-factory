"use client";

import { useBuilder } from '@/contexts/BuilderContext';

export default function PropertiesPanel() {
  const { selectedComponent, updateComponent } = useBuilder();

  if (!selectedComponent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-gray-500">
        <div className="text-5xl mb-4">⚙️</div>
        <h3 className="text-lg font-medium mb-2">No Component Selected</h3>
        <p className="text-center">Click on a component to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Properties</h3>
        <div className="text-sm text-gray-500">
          Editing: {selectedComponent.type}
        </div>
      </div>

      <div className="space-y-6">
        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={selectedComponent.content}
            onChange={(e) => updateComponent(selectedComponent.id, { content: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Background</label>
            <input
              type="color"
              value={selectedComponent.bgColor}
              onChange={(e) => updateComponent(selectedComponent.id, { bgColor: e.target.value })}
              className="w-full h-10 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Text Color</label>
            <input
              type="color"
              value={selectedComponent.textColor}
              onChange={(e) => updateComponent(selectedComponent.id, { textColor: e.target.value })}
              className="w-full h-10 cursor-pointer"
            />
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium mb-2">Size</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Width (px)</label>
              <input
                type="number"
                value={selectedComponent.width}
                onChange={(e) => updateComponent(selectedComponent.id, { width: parseInt(e.target.value) || 100 })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Height (px)</label>
              <input
                type="number"
                value={selectedComponent.height}
                onChange={(e) => updateComponent(selectedComponent.id, { height: parseInt(e.target.value) || 100 })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium mb-2">Position</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">X (px)</label>
              <input
                type="number"
                value={selectedComponent.x}
                onChange={(e) => updateComponent(selectedComponent.id, { x: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Y (px)</label>
              <input
                type="number"
                value={selectedComponent.y}
                onChange={(e) => updateComponent(selectedComponent.id, { y: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium mb-2">Font Size (px)</label>
          <input
            type="range"
            min="12"
            max="48"
            value={selectedComponent.fontSize}
            onChange={(e) => updateComponent(selectedComponent.id, { fontSize: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600">
            {selectedComponent.fontSize}px
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <label className="block text-sm font-medium mb-2">Border Radius (px)</label>
          <input
            type="range"
            min="0"
            max="24"
            value={selectedComponent.borderRadius}
            onChange={(e) => updateComponent(selectedComponent.id, { borderRadius: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600">
            {selectedComponent.borderRadius}px
          </div>
        </div>
      </div>
    </div>
  );
}
