'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { FileExplorer } from './FileExplorer';
import { useState } from 'react';
import { FileNode } from '../types/project.types';
import { File, Folder } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

export function DndFileExplorer() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<FileNode | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveNode(active.data.current as FileNode);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveNode(null);

    if (!over || active.id === over.id) return;

    // Call moveFile action from store
    const { moveFile } = useProjectStore.getState();
    moveFile(active.id as string, over.id as string);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <FileExplorer />
      <DragOverlay>
        {activeNode ? (
          <div className="bg-gray-700 p-2 rounded shadow-lg flex items-center gap-2">
            {activeNode.type === 'folder' ? <Folder size={16} /> : <File size={16} />}
            <span className="text-sm">{activeNode.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
