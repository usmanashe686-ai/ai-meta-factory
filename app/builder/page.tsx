"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useCanvasStore } from "./components/canvas/store";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";

// Dynamic imports for editors (Monaco/Sandpack)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CanvasItem {
  id: string;
  type: string;
  content?: string;
  x: number;
  y: number;
}

const CanvasBlock: React.FC<{ item: CanvasItem }> = ({ item }) => {
  const { moveItem, removeItem } = useCanvasStore();

  const [{ isDragging }, drag] = useDrag({
    type: "CANVAS_ITEM",
    item: { id: item.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        position: "absolute",
        top: item.y,
        left: item.x,
        width: 140,
        height: 70,
        backgroundColor: "#4f46e5",
        color: "#fff",
        borderRadius: 8,
        padding: 12,
        cursor: "move",
        opacity: isDragging ? 0.6 : 1,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="font-semibold">{item.type}</div>
      {item.content && <div className="text-xs mt-1 truncate">{item.content}</div>}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeItem(item.id);
        }}
        className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
      >
        ×
      </button>
    </div>
  );
};

export default function BuilderPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { items, addItem, moveItem } = useCanvasStore();
  const [code, setCode] = React.useState("// Start coding here...\n");

  const [, drop] = useDrop({
    accept: "CANVAS_ITEM",
    drop: (dragged: { id: string }, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      moveItem(dragged.id, offset.x - rect.left, offset.y - rect.top);
    },
  });

  useEffect(() => {
    // Example: Add initial block if canvas is empty
    if (items.length === 0) {
      addItem({
        type: "Welcome",
        content: "Drag me!",
        x: 50,
        y: 50,
      });
    }
  }, [items.length, addItem]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Meta Factory Canvas</h1>
          <p className="text-gray-600">Drag and drop components to build your project</p>
        </header>
        
        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r p-4">
            <h2 className="font-bold mb-4 text-lg">Components</h2>
            <div className="space-y-2">
              <button
                onClick={() =>
                  addItem({
                    type: "Button",
                    content: "Click me",
                    x: 20,
                    y: 20,
                  })
                }
                className="w-full bg-indigo-500 text-white px-4 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Add Button
              </button>
              <button
                onClick={() =>
                  addItem({
                    type: "Text",
                    content: "Hello World",
                    x: 20,
                    y: 100,
                  })
                }
                className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Text
              </button>
              <button
                onClick={() =>
                  addItem({
                    type: "Input",
                    content: "Enter text",
                    x: 20,
                    y: 180,
                  })
                }
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Input
              </button>
              <button
                onClick={() =>
                  addItem({
                    type: "Card",
                    content: "Card content",
                    x: 20,
                    y: 260,
                  })
                }
                className="w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add Card
              </button>
            </div>
            
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Stats</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Components:</span>
                  <span className="font-bold">{items.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative bg-gray-100 overflow-hidden">
            <div
              ref={(node) => {
                canvasRef.current = node;
                drop(node);
              }}
              className="w-full h-full relative"
            >
              {items.map((item) => (
                <CanvasBlock key={item.id} item={item} />
              ))}
              
              {/* Canvas grid background */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{
                  backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                   linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }}></div>
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="w-96 bg-white border-l p-4 flex flex-col">
            <h2 className="font-bold mb-4 text-lg">Code Editor</h2>
            <div className="flex-1 min-h-0">
              <MonacoEditor
                height="100%"
                language="typescript"
                theme="vs-light"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                }}
              />
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold mb-2">Generated Code Preview</h3>
              <pre className="bg-gray-50 p-3 rounded-lg text-sm overflow-auto max-h-32">
                {code.substring(0, 200)}...
              </pre>
              <div className="flex gap-2 mt-4">
                <button 
                  className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
                  onClick={() => navigator.clipboard.writeText(code)}
                >
                  Copy Code
                </button>
                <button 
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => alert('Saved!')}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
