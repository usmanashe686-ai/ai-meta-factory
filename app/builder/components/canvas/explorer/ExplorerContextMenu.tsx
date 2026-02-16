"use client";

import React from 'react';
import { Copy, Edit2, FilePlus, FolderPlus, Trash2 } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

interface ExplorerContextMenuProps {
  x: number;
  y: number;
  path: string;
  type: 'file' | 'folder';
  onClose: () => void;
}

export const ExplorerContextMenu: React.FC<ExplorerContextMenuProps> = ({
  x,
  y,
  path,
  type,
  onClose,
}) => {
  // Use the correct store methods – all work with paths
  const deleteFile = useProjectStore((state) => state.deleteFile);
  const renameFile = useProjectStore((state) => state.renameFile);
  const createFile = useProjectStore((state) => state.createFile);
  const copyFile = useProjectStore((state) => state.copyFile);

  const handleDelete = () => {
    if (confirm(`Delete ${type} "${path}"?`)) {
      deleteFile(path);
    }
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

  const handleCopy = () => {
    copyFile(path);
    onClose();
  };

  const handleNewFile = () => {
    const defaultPath = path + (type === 'folder' ? '' : '/') + 'new-file.tsx';
    createFile(defaultPath, '', false);
    onClose();
  };

  const handleNewFolder = () => {
    if (type === 'folder') {
      const folderName = prompt('Enter folder name:');
      if (folderName) {
        const folderPath = path + '/' + folderName + '/.folder-marker';
        createFile(folderPath, '', false);
      }
    }
    onClose();
  };

  return (
    <div
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded shadow-lg py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      <button
        onClick={handleRename}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"
      >
        <Edit2 className="w-3 h-3" /> Rename
      </button>
      <button
        onClick={handleCopy}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"
      >
        <Copy className="w-3 h-3" /> Duplicate
      </button>
      <button
        onClick={handleNewFile}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"
      >
        <FilePlus className="w-3 h-3" /> New File
      </button>
      {type === 'folder' && (
        <button
          onClick={handleNewFolder}
          className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"
        >
          <FolderPlus className="w-3 h-3" /> New Folder
        </button>
      )}
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2 text-red-400"
      >
        <Trash2 className="w-3 h-3" /> Delete
      </button>
    </div>
  );
};
