"use client";

import { useSimpleBuilder } from '@/contexts/SimpleBuilderContext';
import { useState, useEffect } from 'react';

export default function BuilderPage() {
  const { 
    components, 
    addComponent, 
    removeComponent, 
    updateComponent,
    selectedComponentId,
    setSelectedComponentId
  } = useSimpleBuilder();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle mouse down for drag start
  const handleMouseDown = (e: React.MouseEvent, componentId: string) => {
    e.preventDefault();
    setDraggingId(componentId);
    setSelectedComponentId(componentId);
    
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - parseInt(component.styles.left);
    const offsetY = e.clientY - parseInt(component.styles.top);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId) return;

      const component = components.find(c => c.id === draggingId);
      if (!component) return;

      const newLeft = `${e.clientX - dragOffset.x}px`;
      const newTop = `${e.clientY - dragOffset.y}px`;

      updateComponent(draggingId, {
        ...component,
        styles: {
          ...component.styles,
          left: newLeft,
          top: newTop
        }
      });
    };

    const handleMouseUp = () => {
      setDraggingId(null);
    };

    if (draggingId) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragOffset, components, updateComponent]);

  const selectedComponent = components.find(c => c.id === selectedComponentId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">🏭 Meta Factory AI Builder</h1>
            <div className="flex gap-2">
              <button
                onClick={addComponent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + Add Component
              </button>
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                onClick={() => {
                  // Real AI generation placeholder - will connect to API later
                  const prompt = prompt('Describe the component you want:');
                  if (prompt) {
                    // This will be replaced with real AI API call
                    addComponent();
                  }
                }}
              >
                🎨 AI Generate
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {components.length} components on canvas
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 relative overflow-auto bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="absolute inset-0 p-8">
            {components.map((component) => (
              <div
                key={component.id}
                style={component.styles}
                className={`hover:shadow-lg transition-shadow ${
                  selectedComponentId === component.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                } ${draggingId === component.id ? 'opacity-90' : ''}`}
                onMouseDown={(e) => handleMouseDown(e, component.id)}
                onClick={() => setSelectedComponentId(component.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {component.id}
                  </span>
                  <button 
                    className="text-gray-400 hover:text-red-500 text-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComponent(component.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="whitespace-pre-wrap">{component.content}</div>
                <div className="mt-3 text-xs text-gray-400">
                  Click and drag to move
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-l p-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Properties</h2>
          
          {selectedComponent ? (
            <div className="space-y-6">
              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={selectedComponent.content}
                  onChange={(e) => updateComponent(selectedComponent.id, {
                    content: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={selectedComponent.styles.background}
                    onChange={(e) => updateComponent(selectedComponent.id, {
                      styles: {
                        ...selectedComponent.styles,
                        background: e.target.value
                      }
                    })}
                    className="w-10 h-10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedComponent.styles.background}
                    onChange={(e) => updateComponent(selectedComponent.id, {
                      styles: {
                        ...selectedComponent.styles,
                        background: e.target.value
                      }
                    })}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Border Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={selectedComponent.styles.border.split(' ')[2] || '#3b82f6'}
                    onChange={(e) => {
                      const borderParts = selectedComponent.styles.border.split(' ');
                      borderParts[2] = e.target.value;
                      updateComponent(selectedComponent.id, {
                        styles: {
                          ...selectedComponent.styles,
                          border: borderParts.join(' ')
                        }
                      });
                    }}
                    className="w-10 h-10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedComponent.styles.border.split(' ')[2] || '#3b82f6'}
                    onChange={(e) => {
                      const borderParts = selectedComponent.styles.border.split(' ');
                      borderParts[2] = e.target.value;
                      updateComponent(selectedComponent.id, {
                        styles: {
                          ...selectedComponent.styles,
                          border: borderParts.join(' ')
                        }
                      });
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Left (px)</label>
                    <input
                      type="number"
                      value={parseInt(selectedComponent.styles.left)}
                      onChange={(e) => updateComponent(selectedComponent.id, {
                        styles: {
                          ...selectedComponent.styles,
                          left: `${e.target.value}px`
                        }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Top (px)</label>
                    <input
                      type="number"
                      value={parseInt(selectedComponent.styles.top)}
                      onChange={(e) => updateComponent(selectedComponent.id, {
                        styles: {
                          ...selectedComponent.styles,
                          top: `${e.target.value}px`
                        }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Padding */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Padding (px)
                </label>
                <input
                  type="number"
                  value={parseInt(selectedComponent.styles.padding)}
                  onChange={(e) => updateComponent(selectedComponent.id, {
                    styles: {
                      ...selectedComponent.styles,
                      padding: `${e.target.value}px`
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Radius (px)
                </label>
                <input
                  type="number"
                  value={parseInt(selectedComponent.styles.borderRadius)}
                  onChange={(e) => updateComponent(selectedComponent.id, {
                    styles: {
                      ...selectedComponent.styles,
                      borderRadius: `${e.target.value}px`
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-gray-500">Select a component to edit its properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white border-t p-3 text-sm text-gray-500">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">Canvas ready</span> - Drag components to move, click to select
          </div>
          <div className="flex items-center gap-4">
            <span>Version: 0.1.0</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
