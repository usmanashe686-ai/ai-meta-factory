'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileItem } from '../FileItem';
import { FileNode } from '../../types/project.types';

interface SortableFileItemProps {
  file: FileNode;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onSelect: (file: FileNode) => void;
  onRenameStart: (path: string, currentName: string) => void;
  onDelete: (path: string, type: 'file' | 'folder') => void;
  onDuplicate: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, path: string, type: 'file' | 'folder') => void;
  isRenaming: boolean;
  renamingName: string;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  onRenameInputChange: (value: string) => void;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
}

export function SortableFileItem(props: SortableFileItemProps) {
  const { file } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <FileItem {...props} />
    </div>
  );
}
