"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CanvasComponent as ComponentType } from '@/types';
import { GripVertical, Trash2, Copy, Sparkles, Move } from 'lucide-react';

interface CanvasComponentProps {
  component: ComponentType;
  isSelected: boolean;
  onDelete: () => void;
}

export default function CanvasComponent({ component, isSelected, onDelete }: CanvasComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    ...component.styles,
    position: 'absolute' as const,
    left: component.position.x,
    top: component.position.y,
    border: isSelected ? '3px solid #3b82f6' : component.styles.border || '2px solid transparent',
    boxShadow: isSelected ? '0 10px 30px rgba(59, 130, 246, 0.3)' : component.styles.boxShadow || '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: isSelected ? 100 : isDragging ? 99 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    transformOrigin: '0 0'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
      {...attributes}
      {...listeners}
    >
      {/* Component Content */}
      <div className="relative h-full">
        {/* AI Generated Badge */}
        {component.aiGenerated && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>AI</span>
            </div>
          </div>
        )}

        {/* Drag Handle */}
        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 bg-white border rounded-lg shadow-sm cursor-grab">
            <Move className="h-4 w-4 text-gray-500" />
          </div>
        </div>

        {/* Selection Controls */}
        {isSelected && (
          <div className="absolute -right-10 top-0 space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle duplicate here if needed
              }}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-lg"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Component Type Badge */}
        <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-2 py-1 bg-gray-800 text-white text-xs rounded">
            {component.type}
          </div>
        </div>

        {/* Content Area */}
        <div className="h-full overflow-auto">
          <div className="whitespace-pre-line" style={{ 
            pointerEvents: 'none',
            userSelect: 'none'
          }}>
            {component.content}
          </div>
          
          {/* Code Preview for AI Generated */}
          {component.code && component.code.length > 100 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 font-mono overflow-hidden max-h-20">
                {component.code.substring(0, 150)}...
              </div>
            </div>
          )}
        </div>

        {/* Resize Handles (Visual only for now) */}
        {isSelected && (
          <>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
          </>
        )}
      </div>

      {/* Dragging Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded pointer-events-none"></div>
      )}
    </div>
  );
}
