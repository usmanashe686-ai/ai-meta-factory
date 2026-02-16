'use client';

import React from 'react';
import { useProjectStore } from '../state/project-store';

interface FileContextMenuProps {
  path: string;
  x: number;
  y: number;
  onClose: () => void;
}

export function FileContextMenu({ path, x, y, onClose }: FileContextMenuProps) {
  const { deleteFile, copyFile, renameFile } = useProjectStore();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      deleteFile(path);
    }
    onClose();
  };

  const handleCopy = () => {
    copyFile(path);
    onClose();
  };

  const handleRename = () => {
    const newName = prompt('Enter new name:', path.split('/').pop());
    if (newName && newName !== path.split('/').pop()) {
      const newPath = path.substring(0, path.lastIndexOf('/') + 1) + newName;
      renameFile(path, newPath);
    }
    onClose();
  };

  return (
    <div
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded shadow-lg py-1 min-w-[160px]"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        onClick={handleRename}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"
      >
        Rename
      </button>
      <button
        onClick={handleCopy}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"
      >
        Duplicate
      </button>
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2 text-red-400"
      >
        Delete
      </button>
    </div>
  );
}
