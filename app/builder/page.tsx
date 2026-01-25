"use client";

import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, closestCenter, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Draggable Component
function DraggableComponent({
  component,
  isSelected,
  onClick,
  onDelete
}: {
  component: any;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: component.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${component.x}px`,
    top: `${component.y}px`,
    width: `${component.width}px`,
    height: `${component.height}px`,
    backgroundColor: component.bgColor,
    color: component.textColor,
    fontSize: `${component.fontSize}px`,
    border: isSelected ? '3px solid #3b82f6' : component.isAI ? '2px dashed #8b5cf6' : '1px solid #d1d5db',
    borderRadius: `${component.borderRadius}px`,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    position: 'absolute' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 shadow-lg hover:shadow-xl transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${component.isAI ? 'border-dashed' : ''}`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium bg-black/10 px-2 py-1 rounded">
            {component.type}
          </span>
          {component.isAI && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              ✨ AI
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-500 hover:text-red-500 text-lg"
        >
          ×
        </button>
      </div>
      <div className="whitespace-pre-wrap">{component.content}</div>
      {component.aiPrompt && (
        <div className="mt-2 text-xs text-purple-600">
          "{component.aiPrompt}"
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500 opacity-70">
        Drag to move • Click to select
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const [components, setComponents] = useState([
    {
      id: '1',
      type: 'text',
      content: 'Welcome to Meta Factory AI Builder',
      x: 100,
      y: 100,
      width: 350,
      height: 80,
      bgColor: '#ffffff',
      textColor: '#000000',
      fontSize: 24,
      borderRadius: 8,
      isAI: false
    },
    {
      id: '2',
      type: 'button',
      content: 'Click Me',
      x: 150,
      y: 200,
      width: 140,
      height: 48,
      bgColor: '#3b82f6',
      textColor: '#ffffff',
      fontSize: 16,
      borderRadius: 8,
      isAI: false
    }
  ]);

  const [selectedId, setSelectedId] = useState<string>('1');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState('');

  const addComponent = useCallback((type: string) => {
    const newComponent = {
      id: Date.now().toString(),
      type,
      content: type === 'button' ? 'Click Me' : 
               type === 'card' ? 'Card Content' : 'Text Content',
      x: 50 + Math.random() * 500,
      y: 50 + Math.random() * 300,
      width: type === 'button' ? 140 : 
             type === 'card' ? 300 : 350,
      height: type === 'button' ? 48 : 
              type === 'card' ? 180 : 100,
      bgColor: type === 'button' ? '#3b82f6' : 
               type === 'card' ? '#f8fafc' : '#ffffff',
      textColor: type === 'button' ? '#ffffff' : '#000000',
      fontSize: type === 'button' ? 16 : 18,
      borderRadius: 8,
      isAI: false
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedId(newComponent.id);
  }, []);

  const updateComponent = useCallback((id: string, updates: any) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedId === id) {
      setSelectedId(components.length > 1 ? components[0].id : '');
    }
  }, [selectedId, components]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    const component = components.find(c => c.id === active.id);
    if (component) {
      updateComponent(component.id, {
        x: component.x + delta.x,
        y: component.y + delta.y
      });
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    setAiStatus('Analyzing prompt with AI...');

    try {
      // Call our AI API
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await response.json();
      
      if (data.success) {
        const aiComponent = data.component;
        
        const newComponent = {
          id: Date.now().toString(),
          type: aiComponent.type,
          content: aiComponent.content,
          x: 200 + Math.random() * 300,
          y: 100 + Math.random() * 200,
          width: parseInt(aiComponent.styles.width) || 300,
          height: parseInt(aiComponent.styles.height) || 150,
          bgColor: aiComponent.styles.backgroundColor,
          textColor: aiComponent.styles.color,
          fontSize: aiComponent.styles.fontSize,
          borderRadius: aiComponent.styles.borderRadius,
          isAI: true,
          aiPrompt: aiPrompt
        };

        setComponents(prev => [...prev, newComponent]);
        setSelectedId(newComponent.id);
        setAiPrompt('');
        setAiStatus('✅ AI component generated successfully!');
        
        setTimeout(() => setAiStatus(''), 3000);
      } else {
        throw new Error(data.error || 'AI generation failed');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      
      // Fallback mock component
      const fallbackComponent = {
        id: Date.now().toString(),
        type: 'card',
        content: `AI: ${aiPrompt}`,
        x: 200,
        y: 200,
        width: 320,
        height: 180,
        bgColor: '#e0f2fe',
        textColor: '#0369a1',
        fontSize: 20,
        borderRadius: 16,
        isAI: true,
        aiPrompt: aiPrompt
      };

      setComponents(prev => [...prev, fallbackComponent]);
      setSelectedId(fallbackComponent.id);
      setAiPrompt('');
      setAiStatus('⚠️ Using mock AI (API offline)');
      
      setTimeout(() => setAiStatus(''), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const project = {
      name: 'meta-factory-project',
      version: '1.0.0',
      components: components.map(comp => ({
        type: comp.type,
        content: comp.content,
        position: { x: comp.x, y: comp.y },
        styles: {
          backgroundColor: comp.bgColor,
          color: comp.textColor,
          fontSize: comp.fontSize,
          borderRadius: comp.borderRadius
        },
        isAI: comp.isAI || false
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        totalComponents: components.length,
        aiComponents: components.filter(c => c.isAI).length
      }
    };

    const dataStr = JSON.stringify(project, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileName = `meta-factory-${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  };

  const selectedComponent = components.find(c => c.id === selectedId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏭 Meta Factory AI Builder</h1>
              <p className="text-gray-600">Phase 4 - AI API Integration</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {components.length} components • {components.filter(c => c.isAI).length} AI
              </div>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📦 Export Project
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="col-span-3 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-6">Component Library</h2>
            <div className="space-y-3">
              {['text', 'button', 'card', 'input', 'header'].map((type) => (
                <button
                  key={type}
                  onClick={() => addComponent(type)}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium capitalize">{type}</div>
                  <div className="text-sm text-gray-500">Click to add</div>
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">✨</span>
                <h3 className="font-bold">AI Generator</h3>
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  API
                </span>
              </div>
              
              {aiStatus && (
                <div className={`mb-3 p-2 rounded text-sm ${
                  aiStatus.includes('✅') ? 'bg-green-50 text-green-800' : 
                  aiStatus.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' : 
                  'bg-blue-50 text-blue-800'
                }`}>
                  {aiStatus}
                </div>
              )}
              
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe a component (e.g., 'A blue login button')"
                className="w-full h-28 p-3 border rounded-lg mb-3"
              />
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  '✨ Generate with AI'
                )}
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="col-span-6 bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Canvas</h2>
              <div className="text-sm text-gray-500">
                Drag components to reposition
              </div>
            </div>
            
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="border-2 border-dashed border-gray-300 rounded-xl h-[500px] relative">
                {components.map((component) => (
                  <DraggableComponent
                    key={component.id}
                    component={component}
                    isSelected={selectedId === component.id}
                    onClick={() => setSelectedId(component.id)}
                    onDelete={() => removeComponent(component.id)}
                  />
                ))}
              </div>
            </DndContext>
            
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Regular components: {components.filter(c => !c.isAI).length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>AI components: {components.filter(c => c.isAI).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-3 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-6">Properties</h2>
            {selectedComponent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <input
                    type="text"
                    value={selectedComponent.content}
                    onChange={(e) => updateComponent(selectedComponent.id, { content: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
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
                <div>
                  <label className="block text-sm font-medium mb-2">Font Size: {selectedComponent.fontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={selectedComponent.fontSize}
                    onChange={(e) => updateComponent(selectedComponent.id, { fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <button className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a component to edit
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <span className="font-medium">Status:</span> 
              <span className="ml-2">AI API Active</span>
              <span className="mx-2">•</span>
              <span>Phase 4: Real AI Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
