'use client';

import React from 'react';
import { File, Folder, Copy, Trash2, Edit, ExternalLink } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

interface ExplorerContextMenuProps {
  x: number;
  y: number;
  path?: string;
  onClose: () => void;
}

export const ExplorerContextMenu: React.FC<ExplorerContextMenuProps> = ({ 
  x, 
  y, 
  path, 
  onClose 
}) => {
  const deleteFile = useProjectStore((state) => state.deleteFile);
  const renameFile = useProjectStore((state) => state.renameFile);
  const createFile = useProjectStore((state) => state.createFile);
  
  const handleDelete = () => {
    if (path && confirm(`Delete ${path}?`)) {
      deleteFile(path);
    }
    onClose();
  };
  
  const handleRename = () => {
    if (path) {
      const newName = prompt('Enter new name:', path.split('/').pop());
      if (newName) {
        const newPath = path.split('/').slice(0, -1).concat(newName).join('/');
        renameFile(path, newPath);
      }
    }
    onClose();
  };
  
  const handleNewFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const folderPath = path || '';
      const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
      createFile(fullPath, '// New file', 'typescript');
    }
    onClose();
  };
  
  const handleNewFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const basePath = path || '';
      const fullPath = basePath ? `${basePath}/${folderName}/.keep` : `${folderName}/.keep`;
      createFile(fullPath, '', 'plaintext');
    }
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div 
        className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 min-w-[200px]"
        style={{ left: x, top: y }}
      >
        {path ? (
          <>
            <button
              onClick={handleRename}
              className="w-full px-4 py-2 text-sm hover:bg-gray-700 flex items-center space-x-2"
            >
              <Edit size={14} />
              <span>Rename</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(path);
                onClose();
              }}
              className="w-full px-4 py-2 text-sm hover:bg-gray-700 flex items-center space-x-2"
            >
              <Copy size={14} />
              <span>Copy Path</span>
            </button>
            <div className="h-px bg-gray-700 my-2" />
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-sm hover:bg-red-900/30 text-red-400 flex items-center space-x-2"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleNewFile}
              className="w-full px-4 py-2 text-sm hover:bg-gray-700 flex items-center space-x-2"
            >
              <File size={14} />
              <span>New File</span>
            </button>
            <button
              onClick={handleNewFolder}
              className="w-full px-4 py-2 text-sm hover:bg-gray-700 flex items-center space-x-2"
            >
              <Folder size={14} />
              <span>New Folder</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};
