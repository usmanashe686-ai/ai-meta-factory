'use client';

import { useState } from 'react';
import {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';

interface DragState {
  activeId: UniqueIdentifier | null;
  activeNode: FileNode | null;
  overId: UniqueIdentifier | null;
  overNode: FileNode | null;
}

export function useExplorerDnd() {
  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    activeNode: null,
    overId: null,
    overNode: null,
  });

  const { files, moveFile } = useProjectStore();

  // Helper to find a node by its id in the file tree
  const findNodeById = (id: UniqueIdentifier, nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(id, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const node = findNodeById(active.id, files);
    setDragState({
      activeId: active.id,
      activeNode: node,
      overId: null,
      overNode: null,
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setDragState(prev => ({ ...prev, overId: null, overNode: null }));
      return;
    }
    const node = findNodeById(over.id, files);
    setDragState(prev => ({
      ...prev,
      overId: over.id,
      overNode: node,
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDragState({
      activeId: null,
      activeNode: null,
      overId: null,
      overNode: null,
    });

    if (!over || active.id === over.id) return;

    const activeNode = findNodeById(active.id, files);
    const overNode = findNodeById(over.id, files);

    if (!activeNode || !overNode) return;

    // Determine drop action:
    // - If dropping onto a folder, move into that folder.
    // - If dropping onto a file, move as sibling (same parent).
    // - If dropping onto a folder that is expanded, we might need to insert as child.
    // For simplicity, we'll always treat the target as the drop zone.
    // We'll use the store's moveFile(sourceId, targetId) which should handle the logic.
    moveFile(active.id as string, over.id as string);
  };

  const handleDragCancel = () => {
    setDragState({
      activeId: null,
      activeNode: null,
      overId: null,
      overNode: null,
    });
  };

  return {
    dragState,
    handlers: {
      handleDragStart,
      handleDragOver,
      handleDragEnd,
      handleDragCancel,
    },
  };
}
