"use client";

import React, { useState } from 'react';
import { 
  FileCode, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2,
  FileText,
  FileJson,
  FileImage,
  File
} from 'lucide-react';
import { useProjectStore } from './state/project-store';

export const EnhancedFileTree = () => {
  const { files, openFile, activeFileId, closeFile } = useProjectStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx': return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'ts':
      case 'js': return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'json': return <FileJson className="w-4 h-4 text-green-400" />;
      case 'css': return <FileText className="w-4 h-4 text-pink-400" />;
      default: return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  // ✅ React 19 Fix: Use React.ReactNode[] instead of JSX.Element[]
  const renderTree = (nodes: any[]): React.ReactNode[] => {
    return nodes.map((node) => {
      const isFolder = node.type === 'folder';
      const isExpanded = expandedFolders.has(node.id);
      const isActive = activeFileId === node.id;

      return (
        <div key={node.id} className="select-none">
          <div 
            onClick={() => isFolder ? toggleFolder(node.id) : openFile(node.id)}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-md transition-colors group ${
              isActive ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' : 'hover:bg-white/5 text-gray-400'
            }`}
          >
            {isFolder && (
              isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
            )}
            
            {isFolder ? (
              isExpanded ? <FolderOpen className="w-4 h-4 text-blue-400" /> : <Folder className="w-4 h-4 text-blue-400" />
            ) : (
              getFileIcon(node.name)
            )}

            <span className="text-sm truncate flex-1">{node.name}</span>

            {!isFolder && (
              <button 
                onClick={(e) => { e.stopPropagation(); closeFile(node.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {isFolder && isExpanded && node.children && (
            <div className="ml-4 border-l border-white/5 mt-1">
              {renderTree(node.children)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0d0f] border-r border-white/5">
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Explorer</span>
        <Plus className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {renderTree(files)}
      </div>
    </div>
  );
};
