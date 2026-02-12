'use client';

import React, { useState } from 'react';
import { Folder, File, Plus, Search, MoreVertical, Trash2, Edit, Copy } from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { FileTree } from './FileTree';
import { ExplorerContextMenu } from './ExplorerContextMenu';

export const FileExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    path?: string;
  } | null>(null);
  
  const createFile = useProjectStore((state) => state.createFile);
  const files = useProjectStore((state) => state.files);
  
  const handleCreateFile = () => {
    const path = prompt('Enter file path (e.g., components/Button.tsx):');
    if (path) {
      createFile(path, '// New file created\n', 'typescript');
    }
  };
  
  const handleCreateFolder = () => {
    const path = prompt('Enter folder path (e.g., components):');
    if (path) {
      createFile(`${path}/.keep`, '', 'plaintext');
    }
  };
  
  const handleContextMenu = (e: React.MouseEvent, path?: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      path,
    });
  };
  
  const buildTree = () => {
    const tree: Record<string, any> = {};
    
    Object.keys(files).forEach((filePath) => {
      const parts = filePath.split('/');
      let currentLevel = tree;
      
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = index === parts.length - 1 
            ? { type: 'file', path: filePath } 
            : { type: 'folder', children: {} };
        }
        if (index !== parts.length - 1 && currentLevel[part].children) {
          currentLevel = currentLevel[part].children;
        }
      });
    });
    
    return tree;
  };

  return (
    <div 
      className="h-full flex flex-col bg-gray-900" 
      onContextMenu={(e) => handleContextMenu(e)}
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400">
            Explorer
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateFile}
              className="p-1 hover:bg-gray-700 rounded"
              title="New File"
            >
              <File size={16} />
            </button>
            <button
              onClick={handleCreateFolder}
              className="p-1 hover:bg-gray-700 rounded"
              title="New Folder"
            >
              <Folder size={16} />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <FileTree 
          tree={buildTree()} 
          onContextMenu={handleContextMenu}
        />
      </div>
      
      {contextMenu && (
        <ExplorerContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          path={contextMenu.path}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
