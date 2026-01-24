"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Component } from '@/contexts/BuilderContext';

interface DraggableComponentProps {
  component: Component;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function DraggableComponent({
  component,
  isSelected,
  onClick,
  onDelete
}: DraggableComponentProps) {
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
    left: component.x,
    top: component.y,
    width: component.width,
    height: component.height,
    backgroundColor: component.bgColor,
    color: component.textColor,
    fontSize: component.fontSize,
    borderRadius: component.borderRadius,
    border: isSelected ? '3px solid #3b82f6' : '1px solid #d1d5db',
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
      }`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium bg-black/10 px-2 py-1 rounded">
          {component.type}
        </span>
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
      <div className="whitespace-pre-wrap">
        {component.content}
      </div>
      <div className="mt-2 text-xs text-gray-500 opacity-70">
        Drag to move
      </div>
    </div>
  );
}
