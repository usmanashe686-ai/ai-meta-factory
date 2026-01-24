"use client";

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCorners, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { BuilderProvider, useBuilder } from '@/app/contexts/BuilderContext';
import ComponentPalette from '@/components/builder/ComponentPalette';
import AIPanel from '@/components/builder/AIPanel';
import PropertiesPanel from '@/components/builder/PropertiesPanel';
import CanvasComponent from '@/components/builder/CanvasComponent';
import { 
  LayoutDashboard, Download, Save, Trash2, Zap, 
  Eye, Code, Smartphone, Globe, Settings,
  ChevronRight, Menu, X
} from 'lucide-react';

function BuilderContent() {
  const { 
    components, 
    updateComponent, 
    removeComponent, 
    selectedComponent, 
    setSelectedComponent,
    projectName,
    setProjectName,
    resetCanvas
  } = useBuilder();
  
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiTemplatePrompt, setAiTemplatePrompt] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'components' | 'layers' | 'export'>('components');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const component = components.find(c => c.id === event.active.id);
    if (component) {
      setSelectedComponent(component.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, delta } = event;
    
    if (delta.x !== 0 || delta.y !== 0) {
      const component = components.find(c => c.id === active.id);
      if (component) {
        updateComponent(component.id, {
          position: {
            x: component.position.x + delta.x,
            y: component.position.y + delta.y
          }
        });
      }
    }
  };

  const handleAITemplateClick = (prompt: string) => {
    setAiTemplatePrompt(prompt);
    setAiPanelOpen(true);
  };

  const handleAIGenerate = (code: string, styles: Record<string, string>) => {
    // Add AI generated component
    const { addComponent } = useBuilder();
    addComponent({
      type: 'custom',
      content: '✨ AI Generated Component\n' + code.substring(0, 100) + '...',
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 100 },
      styles: {
        ...styles,
        padding: '24px',
        backgroundColor: '#f0f9ff',
        border: '2px solid #7dd3fc',
        borderRadius: '12px',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1.5'
      },
      code,
      aiGenerated: true
    });
  };

  const exportAsReact = () => {
    const code = components.map(comp => \`
// Component: \${comp.type} (\${comp.id})
const \${comp.type.charAt(0).toUpperCase() + comp.type.slice(1)}Component = () => (
  <div 
    style=\${JSON.stringify(comp.styles, null, 2)}
    className="\${comp.type}"
  >
    {\`\${comp.content}\`}
  </div>
);
\`).join('\\n');

    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`\${projectName.replace(/\\s+/g, '-').toLowerCase()}-components.js\`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </button>
              
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Meta Factory AI Builder</h1>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0"
                  placeholder="Project Name"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setAiPanelOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                <span>Generate with AI</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <button
                onClick={exportAsReact}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Export React</span>
              </button>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-4">
            {[
              { id: 'components', label: 'Components', icon: LayoutDashboard },
              { id: 'layers', label: 'Layers', icon: Eye },
              { id: 'export', label: 'Export', icon: Download }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={\`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors \${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}\`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
            
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Auto-save</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>AI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className={\`\${sidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 flex flex-col border-r bg-white\`}>
          {!sidebarCollapsed && (
            <>
              {activeTab === 'components' && (
                <ComponentPalette onAITemplateClick={handleAITemplateClick} />
              )}
              
              {activeTab === 'layers' && (
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-4">Component Layers</h3>
                  <div className="space-y-2">
                    {components.map((comp, index) => (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedComponent(comp.id)}
                        className={\`p-3 border rounded-lg cursor-pointer transition-colors \${selectedComponent === comp.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}\`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <div>
                              <div className="font-medium capitalize">{comp.type}</div>
                              <div className="text-xs text-gray-500">
                                {Math.round(comp.position.x)}px, {Math.round(comp.position.y)}px
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeComponent(comp.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'export' && (
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-4">Export Options</h3>
                  <div className="space-y-3">
                    <button
                      onClick={exportAsReact}
                      className="w-full p-4 border rounded-lg hover:bg-blue-50 text-left flex items-center gap-3"
                    >
                      <Code className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">React Components</div>
                        <div className="text-sm text-gray-500">Export as React/TypeScript files</div>
                      </div>
                    </button>
                    
                    <button className="w-full p-4 border rounded-lg hover:bg-green-50 text-left flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Android APK</div>
                        <div className="text-sm text-gray-500">Generate mobile app package</div>
                      </div>
                    </button>
                    
                    <button className="w-full p-4 border rounded-lg hover:bg-purple-50 text-left flex items-center gap-3">
                      <Globe className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Deploy to Web</div>
                        <div className="text-sm text-gray-500">Deploy directly to Vercel</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas Toolbar */}
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{components.length}</span> components • 
                <span className="font-medium ml-2">{selectedComponent ? '1' : '0'}</span> selected
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={resetCanvas}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm"
                >
                  Reset Canvas
                </button>
                <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                  Clear Selection
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className={\`w-2 h-2 rounded-full \${isDragging ? 'bg-yellow-500' : 'bg-gray-300'}\`}></div>
                <span>{isDragging ? 'Dragging' : 'Ready'}</span>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-auto p-8">
            <div 
              className="min-h-full bg-white rounded-xl border-3 border-dashed border-gray-300 relative shadow-inner"
              style={{
                backgroundImage: \`
                  linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                  linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)
                \`,
                backgroundSize: '50px 50px'
              }}
              onClick={() => setSelectedComponent(null)}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={components.map(c => c.id)}
                  strategy={rectSortingStrategy}
                >
                  {components.map((component) => (
                    <CanvasComponent
                      key={component.id}
                      component={component}
                      isSelected={selectedComponent === component.id}
                      onDelete={() => removeComponent(component.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Empty State */}
              {components.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-7xl mb-6 text-gray-300">🎨</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Canvas is Empty</h3>
                  <p className="text-gray-500 mb-6">Add components from the left panel or generate with AI</p>
                  <button
                    onClick={() => handleAITemplateClick('Create a welcome dashboard for a builder tool')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    Generate with AI
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-96 border-l bg-white overflow-hidden">
          <PropertiesPanel />
        </div>
      </div>

      {/* AI Panel */}
      <AIPanel
        isOpen={aiPanelOpen}
        onClose={() => {
          setAiPanelOpen(false);
          setAiTemplatePrompt('');
        }}
        onGenerate={handleAIGenerate}
        initialPrompt={aiTemplatePrompt}
      />

      {/* Status Bar */}
      <div className="border-t bg-white px-6 py-2 text-sm text-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Builder Ready</span>
          </div>
          <div>•</div>
          <div>Drag components to reposition</div>
          <div>•</div>
          <div>Double-click to edit text</div>
        </div>
        <div>
          <span className="font-medium">Meta Factory AI Builder</span> • v1.0
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <BuilderContent />
    </BuilderProvider>
  );
}
