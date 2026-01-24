"use client";

import { useState } from 'react';

interface Component {
  id: string;
  type: 'text' | 'button' | 'input' | 'card' | 'container';
  content: string;
  x: number;
  y: number;
  color: string;
  width: string;
  height: string;
  fontSize: string;
}

export default function BuilderPage() {
  // Initial component
  const [components, setComponents] = useState<Component[]>([
    {
      id: '1',
      type: 'text',
      content: 'Welcome to Meta Factory AI Builder!',
      x: 100,
      y: 100,
      color: '#ffffff',
      width: '300px',
      height: 'auto',
      fontSize: '16px'
    }
  ]);

  const [selectedId, setSelectedId] = useState<string>('1');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Add a new component
  const addComponent = (type: Component['type']) => {
    const newComponent: Component = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      x: 50 + Math.random() * 500,
      y: 50 + Math.random() * 300,
      color: getDefaultColor(type),
      width: getDefaultWidth(type),
      height: getDefaultHeight(type),
      fontSize: '16px'
    };

    setComponents([...components, newComponent]);
    setSelectedId(newComponent.id);
  };

  // Helper functions
  const getDefaultContent = (type: Component['type']): string => {
    switch (type) {
      case 'button': return 'Click Me';
      case 'input': return 'Enter text...';
      case 'card': return 'Card Title\nCard content goes here';
      case 'container': return 'Container';
      default: return 'Sample Text';
    }
  };

  const getDefaultColor = (type: Component['type']): string => {
    switch (type) {
      case 'button': return '#3b82f6';
      case 'card': return '#ffffff';
      case 'container': return '#f3f4f6';
      default: return '#ffffff';
    }
  };

  const getDefaultWidth = (type: Component['type']): string => {
    switch (type) {
      case 'button': return '120px';
      case 'input': return '200px';
      case 'card': return '300px';
      case 'container': return '400px';
      default: return '200px';
    }
  };

  const getDefaultHeight = (type: Component['type']): string => {
    switch (type) {
      case 'button': return '40px';
      case 'input': return '40px';
      case 'card': return '200px';
      case 'container': return '300px';
      default: return 'auto';
    }
  };

  // Update component
  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  // Delete component
  const deleteComponent = (id: string) => {
    const newComponents = components.filter(comp => comp.id !== id);
    setComponents(newComponents);
    
    if (selectedId === id) {
      setSelectedId(newComponents.length > 0 ? newComponents[0].id : '');
    }
  };

  // Handle AI generation
  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) return;

    const aiComponent: Component = {
      id: Date.now().toString(),
      type: 'card',
      content: `AI Generated: ${aiPrompt}`,
      x: 150,
      y: 150,
      color: '#f0f9ff',
      width: '350px',
      height: '200px',
      fontSize: '14px'
    };

    setComponents([...components, aiComponent]);
    setSelectedId(aiComponent.id);
    setShowAIPanel(false);
    setAiPrompt('');
  };

  // Get selected component
  const selectedComponent = components.find(comp => comp.id === selectedId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏭 Meta Factory AI Builder</h1>
              <p className="text-gray-600 text-sm">Build components visually with AI assistance</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => addComponent('card')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + Add Component
              </button>
              <button
                onClick={() => setShowAIPanel(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2"
              >
                <span>✨</span>
                <span>AI Generate</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Component Library */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow p-6 sticky top-6">
              <h2 className="text-lg font-bold mb-6 text-gray-800">Component Library</h2>
              
              <div className="space-y-3 mb-8">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Basic Components</h3>
                {[
                  { type: 'text' as const, label: 'Text', icon: '📝' },
                  { type: 'button' as const, label: 'Button', icon: '🔘' },
                  { type: 'input' as const, label: 'Input Field', icon: '⌨️' },
                  { type: 'card' as const, label: 'Card', icon: '🃏' },
                  { type: 'container' as const, label: 'Container', icon: '📦' }
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addComponent(item.type)}
                    className="w-full flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">Click to add</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Project Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{components.length}</div>
                    <div className="text-sm text-gray-600">Components</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{selectedId ? 1 : 0}</div>
                    <div className="text-sm text-gray-600">Selected</div>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setComponents([{
                    id: '1',
                    type: 'text',
                    content: 'Welcome to Meta Factory AI Builder!',
                    x: 100,
                    y: 100,
                    color: '#ffffff',
                    width: '300px',
                    height: 'auto',
                    fontSize: '16px'
                  }]);
                  setSelectedId('1');
                }}
                className="w-full mt-6 p-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Reset Canvas
              </button>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="col-span-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Canvas</h2>
                <div className="text-sm text-gray-500">
                  Click and drag components | {components.length} items
                </div>
              </div>

              <div 
                className="border-3 border-dashed border-gray-300 rounded-xl min-h-[600px] relative bg-gradient-to-br from-gray-50 to-white"
                onClick={() => setSelectedId('')}
              >
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-20" 
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #d1d5db 1px, transparent 1px),
                      linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                  }}
                />

                {/* Components */}
                {components.map((component) => (
                  <div
                    key={component.id}
                    style={{
                      position: 'absolute',
                      left: component.x,
                      top: component.y,
                      backgroundColor: component.color,
                      border: selectedId === component.id ? '3px solid #3b82f6' : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: selectedId === component.id 
                        ? '0 10px 25px rgba(59, 130, 246, 0.3)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      width: component.width,
                      minHeight: component.height,
                      padding: '16px',
                      fontSize: component.fontSize,
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      transform: selectedId === component.id ? 'scale(1.02)' : 'scale(1)',
                      zIndex: selectedId === component.id ? 10 : 1,
                      whiteSpace: 'pre-line'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(component.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const newContent = prompt('Enter new content:', component.content);
                      if (newContent !== null) {
                        updateComponent(component.id, { content: newContent });
                      }
                    }}
                    className="hover:shadow-lg"
                  >
                    <div className="font-medium">{component.content}</div>
                    
                    {selectedId === component.id && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteComponent(component.id);
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateComponent(component.id, {
                              x: component.x + 20,
                              y: component.y + 20
                            });
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Move
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty State */}
                {components.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <div className="text-7xl mb-4">🎨</div>
                    <h3 className="text-2xl font-bold mb-2">Empty Canvas</h3>
                    <p className="text-gray-500">Add components from the left panel to get started</p>
                    <button
                      onClick={() => addComponent('card')}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90"
                    >
                      Add Your First Component
                    </button>
                  </div>
                )}
              </div>

              {/* Canvas Instructions */}
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>• Click to select • Double-click to edit text • Use properties panel to customize</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties Panel */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow p-6 sticky top-6">
              <h2 className="text-lg font-bold mb-6 text-gray-800">
                Properties {selectedComponent && `- ${selectedComponent.type}`}
              </h2>

              {selectedComponent ? (
                <div className="space-y-6">
                  {/* Component Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Component ID</div>
                    <div className="font-mono text-sm">{selectedComponent.id.substring(0, 8)}...</div>
                    <div className="text-xs text-gray-500 mt-2">Position: ({selectedComponent.x}, {selectedComponent.y})</div>
                  </div>

                  {/* Content Editor */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={selectedComponent.content}
                      onChange={(e) => updateComponent(selectedComponent.id, { content: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter component content..."
                    />
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={selectedComponent.color}
                        onChange={(e) => updateComponent(selectedComponent.id, { color: e.target.value })}
                        className="w-12 h-12 cursor-pointer rounded border"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={selectedComponent.color}
                          onChange={(e) => updateComponent(selectedComponent.id, { color: e.target.value })}
                          className="w-full p-2 border rounded font-mono text-sm"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                    
                    {/* Color Presets */}
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-2">Quick Colors</div>
                      <div className="flex flex-wrap gap-2">
                        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ffffff', '#000000', '#f3f4f6'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateComponent(selectedComponent.id, { color })}
                            style={{ backgroundColor: color }}
                            className="w-8 h-8 rounded border hover:scale-110 transition-transform"
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Position Controls */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Position</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">X Position</div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={selectedComponent.x}
                            onChange={(e) => updateComponent(selectedComponent.id, { x: parseInt(e.target.value) || 0 })}
                            className="flex-1 p-2 border rounded"
                          />
                          <button
                            onClick={() => updateComponent(selectedComponent.id, { x: selectedComponent.x - 10 })}
                            className="px-3 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => updateComponent(selectedComponent.id, { x: selectedComponent.x + 10 })}
                            className="px-3 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            →
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Y Position</div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={selectedComponent.y}
                            onChange={(e) => updateComponent(selectedComponent.id, { y: parseInt(e.target.value) || 0 })}
                            className="flex-1 p-2 border rounded"
                          />
                          <button
                            onClick={() => updateComponent(selectedComponent.id, { y: selectedComponent.y - 10 })}
                            className="px-3 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => updateComponent(selectedComponent.id, { y: selectedComponent.y + 10 })}
                            className="px-3 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Size Controls */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Width</div>
                        <input
                          value={selectedComponent.width}
                          onChange={(e) => updateComponent(selectedComponent.id, { width: e.target.value })}
                          className="w-full p-2 border rounded"
                          placeholder="e.g., 200px or 100%"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Height</div>
                        <input
                          value={selectedComponent.height}
                          onChange={(e) => updateComponent(selectedComponent.id, { height: e.target.value })}
                          className="w-full p-2 border rounded"
                          placeholder="e.g., 100px or auto"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteComponent(selectedComponent.id)}
                    className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete This Component
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                  <div className="text-5xl mb-4">🎯</div>
                  <p className="text-gray-600 font-medium">No Component Selected</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Click on any component in the canvas to edit its properties
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* AI Panel Modal */}
      {showAIPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">AI Component Generator</h3>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Describe what you want to build and AI will generate it for you:
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: A user profile card with avatar, name, bio, and follow button..."
                className="w-full h-32 p-4 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  ✨ AI Pipeline: OpenAI → DeepSeek → Gemini → Your Canvas
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="px-5 py-2.5 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={!aiPrompt.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  Generate Component
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 border-t pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>🏭 Meta Factory AI Builder • Build visually with AI • Export as React/APK/Web App</p>
          <p className="mt-2">Click • Drag • Edit • Generate • Deploy</p>
        </div>
      </footer>
    </div>
  );
}
