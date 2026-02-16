'use client';

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';

export function EditorTabs() {
  const { files, openFiles, activeFileId, closeFile, setActiveFile } = useProjectStore();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view when it changes
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

  if (openFiles.length === 0) {
    return (
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <span className="text-sm text-gray-400">No open files</span>
      </div>
    );
  }

  return (
    <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto" ref={tabsRef}>
      {openFiles.map((fileId) => {
        const file = files.find(f => f.id === fileId);
        if (!file) return null; // file might be deleted but still in openFiles? Should not happen, but handle gracefully
        return (
          <div
            key={file.id}
            data-file-id={file.id}
            onClick={() => setActiveFile(file.id)}
            className={`
              flex items-center h-full px-3 border-r border-gray-700 cursor-pointer
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
