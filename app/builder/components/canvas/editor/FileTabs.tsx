"use client";

import { X } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

export function FileTabs() {
  const { openFiles, activeFileId, setActiveFile, closeFile } = useProjectStore();

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center border-b border-gray-800 bg-gray-900/50 overflow-x-auto">
      {openFiles.map((file) => {
        const fileName = file.name;
        const isActive = activeFileId === file.id;

        return (
          <div
            key={file.id}
            className={`group flex items-center px-4 py-2 border-r border-gray-800 cursor-pointer whitespace-nowrap ${
              isActive ? 'bg-gray-800' : 'bg-gray-900/30 hover:bg-gray-800/50'
            }`}
            onClick={() => setActiveFile(file.id)}
          >
            <span className="text-sm font-medium text-gray-300">
              {fileName}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
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
