"use client";

import { useState } from 'react';
import {
  FileText, Folder, FolderOpen, ChevronRight, ChevronDown,
  Plus, Trash2, FileCode, FileJson, FileImage, Search, 
  MoreVertical, Edit2, Copy, FolderPlus, X, Check,
  Type, File, FileType
} from 'lucide-react';

export function TreeFileExplorer() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'app']));
  
  const treeData = [
    {
      name: 'src',
      type: 'folder' as const,
      children: [
        { name: 'App.tsx', type: 'file' as const },
        { name: 'index.ts', type: 'file' as const },
        { name: 'components', type: 'folder' as const, children: [] },
      ]
    },
    { name: 'package.json', type: 'file' as const },
    { name: 'README.md', type: 'file' as const },
  ];

  const renderTree = (items: any[], depth = 0) => {
    return items.map((item, index) => {
      const isExpanded = expandedFolders.has(item.name);
      
      return (
        <div key={`${item.name}-${index}`} className="select-none">
          <div
            className="flex items-center py-1 px-2 hover:bg-gray-800/50 cursor-pointer"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => {
              if (item.type === 'folder') {
                const newExpanded = new Set(expandedFolders);
                if (isExpanded) {
                  newExpanded.delete(item.name);
                } else {
                  newExpanded.add(item.name);
                }
                setExpandedFolders(newExpanded);
              }
            }}
          >
            {item.type === 'folder' && (
              <div className="w-4 mr-1">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </div>
            )}
            
            <div className="mr-2">
              {item.type === 'folder' ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Folder className="w-4 h-4 text-yellow-500/70" />
                )
              ) : item.name.endsWith('.tsx') || item.name.endsWith('.ts') ? (
                <FileCode className="w-4 h-4 text-blue-400" />
              ) : item.name.endsWith('.json') ? (
                <FileJson className="w-4 h-4 text-yellow-400" />
              ) : item.name.endsWith('.md') ? (
                <FileText className="w-4 h-4 text-gray-400" />
              ) : (
                <FileText className="w-4 h-4 text-gray-400" />
              )}
            </div>
            
            <span className="text-sm truncate">{item.name}</span>
          </div>
          
          {item.type === 'folder' && isExpanded && item.children && (
            <div>
              {renderTree(item.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 border-r border-gray-800">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-300">Tree Explorer</h3>
          <div className="flex items-center gap-1">
            <button
              className="p-1 hover:bg-gray-800 rounded"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
            <button
              className="p-1 hover:bg-gray-800 rounded"
              title="New File"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search files..."
            className="w-full pl-7 pr-2 py-1 text-xs bg-gray-800/50 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {renderTree(treeData)}
      </div>
    </div>
  );
}
