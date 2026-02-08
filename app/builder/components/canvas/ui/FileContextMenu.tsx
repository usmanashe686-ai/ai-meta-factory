"use client";

import { useProjectStore } from '../state/project-store';

interface FileContextMenuProps {
  path: string;
  x: number;
  y: number;
  onClose: () => void;
}

export function FileContextMenu({ path, x, y, onClose }: FileContextMenuProps) {
  const { removeFile, copyFile, renameFile } = useProjectStore();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      removeFile(path);
      onClose();
    }
  };

  const handleDuplicate = () => {
    copyFile(path);
    onClose();
  };

  const handleRename = () => {
    const newName = prompt('Enter new name:', path.split('/').pop());
    if (newName) {
      const newPath = path.replace(/[^\/]+$/, newName);
      renameFile(path, newPath);
      onClose();
    }
  };

  return (
    <div
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded shadow-lg py-1"
      style={{ left: x, top: y }}
    >
      <button
        onClick={handleRename}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700"
      >
        Rename
      </button>
      <button
        onClick={handleDuplicate}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700"
      >
        Duplicate
      </button>
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 text-red-400"
      >
        Delete
      </button>
    </div>
  );
}
