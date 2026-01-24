"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { CanvasComponent as ComponentType } from '@/app/contexts/BuilderContext';

interface CanvasComponentProps {
  component: ComponentType;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

export default function CanvasComponent({ 
  component, 
  isSelected, 
  onClick,
  onDelete 
}: CanvasComponentProps) {
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
    opacity: isDragging ? 0.5 : 1,
    ...component.styles,
    position: 'absolute' as const,
    left: component.position.x,
    top: component.position.y,
    border: isSelected ? '2px solid #3b82f6' : component.styles.border,
    zIndex: isSelected ? 10 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={\`relative group \${isDragging ? 'cursor-grabbing' : 'cursor-move'}\`}
      onClick={onClick}
    >
      {/* Drag handle */}
      <div
        className="absolute -left-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      {/* Delete button */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      {/* Component content */}
      <div className="whitespace-pre-line">
        {component.content}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -inset-1 border-2 border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
}
