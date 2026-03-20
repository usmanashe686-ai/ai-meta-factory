'use client';

import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';

export function EditorTabs() {
  // Fixed: using openFiles to match project-store.ts
  const { files, openFiles, activeFileId, closeFile, setActiveFile } = useProjectStore();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Helper to find file in nested structure
  const findFileById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findFileById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    if (activeFileId && tabsRef.current) {
      const activeTab = tabsRef.current.querySelector(`[data-file-id="${activeFileId}"]`);
      activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeFileId]);

  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeFile(fileId);
  };

  if (!openFiles || openFiles.length === 0) {
    return (
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <span className="text-sm text-gray-400">No open files</span>
      </div>
    );
  }

  return (
    <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto no-scrollbar" ref={tabsRef}>
      {openFiles.map((fileId) => {
        const file = findFileById(files, fileId);
        if (!file) return null;
        
        return (
          <div
            key={file.id}
            data-file-id={file.id}
            onClick={() => setActiveFile(file.id)}
            className={`flex items-center h-full px-3 border-r border-gray-700 cursor-pointer whitespace-nowrap transition-colors
              ${activeFileId === file.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'}
            `}
          >
            <span className="text-sm truncate max-w-[150px]">{file.name}</span>
            <button
              className="ml-2 p-0.5 hover:bg-gray-600 rounded"
              onClick={(e) => handleCloseTab(file.id, e)}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
