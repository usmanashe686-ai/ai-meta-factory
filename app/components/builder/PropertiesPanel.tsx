"use client";

import { useBuilder } from '@/contexts/BuilderContext';
import { useState } from 'react';

export default function PropertiesPanel() {
  const { selectedComponent, updateComponent } = useBuilder();
  const [activeTab, setActiveTab] = useState('style');

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Properties</h3>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {selectedComponent.type}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Editing: {selectedComponent.id}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'style' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'layout' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('layout')}
        >
          Layout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text Content</label>
              <textarea
                value={selectedComponent.content}
                onChange={(e) => updateComponent(selectedComponent.id, { content: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
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
              <div className="text-center text-sm text-gray-600 mt-1">
                {selectedComponent.fontSize}px
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <input
                type="color"
                value={selectedComponent.bgColor}
                onChange={(e) => updateComponent(selectedComponent.id, { bgColor: e.target.value })}
                className="w-full h-12 cursor-pointer rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <input
                type="color"
                value={selectedComponent.textColor}
                onChange={(e) => updateComponent(selectedComponent.id, { textColor: e.target.value })}
                className="w-full h-12 cursor-pointer rounded-lg"
              />
            </div>
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
              <div className="text-center text-sm text-gray-600 mt-1">
                {selectedComponent.borderRadius}px
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">X Position</label>
                  <input
                    type="number"
                    value={selectedComponent.x}
                    onChange={(e) => updateComponent(selectedComponent.id, { x: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Y Position</label>
                  <input
                    type="number"
                    value={selectedComponent.y}
                    onChange={(e) => updateComponent(selectedComponent.id, { y: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Width</label>
                  <input
                    type="number"
                    value={selectedComponent.width}
                    onChange={(e) => updateComponent(selectedComponent.id, { width: parseInt(e.target.value) || 100 })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Height</label>
                  <input
                    type="number"
                    value={selectedComponent.height}
                    onChange={(e) => updateComponent(selectedComponent.id, { height: parseInt(e.target.value) || 100 })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="font-medium mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateComponent(selectedComponent.id, { bgColor: '#3b82f6', textColor: '#ffffff' })}
              className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
            >
              Blue Theme
            </button>
            <button
              onClick={() => updateComponent(selectedComponent.id, { bgColor: '#10b981', textColor: '#ffffff' })}
              className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
            >
              Green Theme
            </button>
            <button
              onClick={() => updateComponent(selectedComponent.id, { borderRadius: 0 })}
              className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Square Corners
            </button>
            <button
              onClick={() => updateComponent(selectedComponent.id, { borderRadius: 16 })}
              className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Rounded
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
