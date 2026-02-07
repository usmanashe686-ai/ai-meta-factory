"use client";

import { X } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

export function FileTabs() {
  const { files, activeFile, setActiveFile, removeFile } = useProjectStore();
  
  const openFiles = Object.keys(files).filter(path => 
    !path.includes('.folder-marker') && path.split('/').pop()
  );
  
  if (openFiles.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center border-b border-gray-800 bg-gray-900/50">
      {openFiles.map((path) => {
        const fileName = path.split('/').pop() || path;
        const isActive = activeFile === path;
        
        return (
          <div
            key={path}
            className={`group flex items-center px-4 py-2 border-r border-gray-800 cursor-pointer ${
              isActive 
                ? 'bg-gray-800' 
                : 'bg-gray-900/30 hover:bg-gray-800/50'
            }`}
            onClick={() => setActiveFile(path)}
          >
            <span className="text-sm font-medium text-gray-300">
              {fileName}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile(path);
              }}
              className="ml-2 p-0.5 rounded hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
