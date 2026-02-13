'use client';

import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';
import { X, File, FileCode, FileJson, FileText } from 'lucide-react';
import { useRef, useEffect } from 'react';

// Helper to get appropriate icon based on file extension
const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode size={16} className="text-yellow-400" />;
    case 'json':
      return <FileJson size={16} className="text-yellow-600" />;
    case 'md':
    case 'txt':
      return <FileText size={16} className="text-blue-400" />;
    default:
      return <File size={16} className="text-gray-400" />;
  }
};

export function EditorTabs() {
  const { openFiles, activeFileId, closeFile, setActiveFile } = useProjectStore();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view when it changes
  useEffect(() => {
    if (!activeFileId || !tabsRef.current) return;
    const activeTab = tabsRef.current.querySelector(`[data-file-id="${activeFileId}"]`);
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeFileId]);

  const handleClose = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeFile(fileId);
  };

  if (!openFiles || openFiles.length === 0) {
    return (
      <div className="flex items-center h-9 px-2 bg-gray-800 border-b border-gray-700 text-gray-400 text-sm">
        No files open
      </div>
    );
  }

  return (
    <div className="flex items-center h-9 bg-gray-800 border-b border-gray-700 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600">
      <div ref={tabsRef} className="flex">
        {openFiles.map((file) => (
          <div
            key={file.id}
            data-file-id={file.id}
            onClick={() => setActiveFile(file.id)}
            className={`
              group flex items-center gap-1.5 px-3 py-1.5 border-r border-gray-700 
              cursor-pointer text-sm transition-colors select-none
              ${
                activeFileId === file.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }
            `}
          >
            {getFileIcon(file.name)}
            <span className="max-w-[120px] truncate">{file.name}</span>
            <button
              onClick={(e) => handleClose(file.id, e)}
              className="ml-1 p-0.5 rounded hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Close file"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      {/* Optional: add a "new file" button – will be implemented later */}
      <button className="ml-2 p-1 text-gray-400 hover:text-white">
        <span className="text-xl leading-4">+</span>
      </button>
    </div>
  );
}
