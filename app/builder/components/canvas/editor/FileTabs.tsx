"use client";

import { X } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

export function FileTabs() {
  const { files, activeFile, setActiveFile, deleteFile } = useProjectStore();
  
  const openFiles = Object.keys(files).filter(path => 
    path.endsWith('.tsx') || 
    path.endsWith('.ts') || 
    path.endsWith('.jsx') || 
    path.endsWith('.js') ||
    path.endsWith('.css')
  );
  
  return (
    <div className="flex border-b border-gray-800 bg-gray-900/50 overflow-x-auto">
      {openFiles.map((path) => {
        const file = files[path];
        const isActive = activeFile === path;
        
        return (
          <div
            key={path}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-800 min-w-40
              ${isActive 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-900/30 text-gray-400 hover:bg-gray-800/50'
              }
            `}
            onClick={() => setActiveFile(path)}
          >
            <div className={`w-2 h-2 rounded-full ${
              file.language === 'typescript' ? 'bg-blue-500' :
              file.language === 'javascript' ? 'bg-yellow-500' :
              file.language === 'css' ? 'bg-pink-500' :
              'bg-gray-500'
            }`} />
            
            <span className="truncate">
              {path.split('/').pop()}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (openFiles.length > 1) {
                  deleteFile(path);
                }
              }}
              className="ml-auto p-0.5 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
