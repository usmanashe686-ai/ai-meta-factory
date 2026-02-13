'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useExplorerDnd } from '../../hooks/useExplorerDnd';
import { FileExplorer } from '../FileExplorer';
import { FileNode } from '../../types/project.types';
import { File, Folder } from 'lucide-react';

interface DndExplorerProps {
  // Props if any (e.g., className)
}

export function DndExplorer({}: DndExplorerProps) {
  const { dragState, handlers } = useExplorerDnd();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start dragging after moving 5px
      },
    }),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handlers.handleDragStart}
      onDragOver={handlers.handleDragOver}
      onDragEnd={handlers.handleDragEnd}
      onDragCancel={handlers.handleDragCancel}
    >
      {/* The file tree – we assume FileExplorer internally uses SortableContext 
          or at least provides draggable nodes. For now, we just wrap the existing 
          FileExplorer which we will modify to use useDraggable/useDroppable. */}
      <FileExplorer />

      <DragOverlay>
        {dragState.activeNode ? (
          <div className="bg-gray-700 text-white p-2 rounded shadow-lg flex items-center gap-2 opacity-90">
            {dragState.activeNode.type === 'folder' ? (
              <Folder size={16} />
            ) : (
              <File size={16} />
            )}
            <span className="text-sm">{dragState.activeNode.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
