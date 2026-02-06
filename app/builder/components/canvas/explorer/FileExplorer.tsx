"use client";

import { useState } from 'react';
import { FileText, Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Trash2, Search } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: Record<string, TreeNode>;
  path?: string;
}

export function FileExplorer() {
  const { files, activeFile, setActiveFile, createFile, deleteFile } = useProjectStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [searchQuery, setSearchQuery] = useState('');
  
  // Build tree from files
  const buildTree = (): Record<string, TreeNode> => {
    const tree: Record<string, TreeNode> = {};
    
    Object.keys(files).forEach((path) => {
      const parts = path.split('/');
      let currentLevel = tree;
      
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            type: index === parts.length - 1 ? 'file' : 'folder',
            ...(index === parts.length - 1 ? { path } : { children: {} })
          };
        }
        
        if (index < parts.length - 1) {
          currentLevel[part].children = currentLevel[part].children || {};
          currentLevel = currentLevel[part].children!;
        }
      });
    });
    
    return tree;
  };
  
  const renderTree = (nodes: Record<string, TreeNode>, parentPath = ''): JSX.Element[] => {
    return Object.entries(nodes)
      .filter(([name, node]) => 
        searchQuery === '' || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.path?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(([name, node]) => {
        const fullPath = parentPath ? `${parentPath}/${name}` : name;
        const isExpanded = expandedFolders.has(fullPath);
        
        return (
          <div key={fullPath}>
            <div
              className={`flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-gray-800/50 cursor-pointer ${
                activeFile === node.path ? 'bg-blue-500/20' : ''
              }`}
              onClick={() => {
                if (node.type === 'folder') {
                  const newExpanded = new Set(expandedFolders);
                  if (isExpanded) {
                    newExpanded.delete(fullPath);
                  } else {
                    newExpanded.add(fullPath);
                  }
                  setExpandedFolders(newExpanded);
                } else if (node.path) {
                  setActiveFile(node.path);
                }
              }}
            >
              {node.type === 'folder' ? (
                <>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Folder className="w-4 h-4 text-blue-400" />
                  )}
                </>
              ) : (
                <>
                  <div className="w-4" />
                  <FileText className="w-4 h-4 text-gray-400" />
                </>
              )}
              <span className="truncate">{node.name}</span>
              
              {node.type === 'file' && node.path && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(node.path!);
                  }}
                  className="ml-auto p-1 hover:bg-red-500/20 rounded opacity-0 hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {node.type === 'folder' && node.children && isExpanded && (
              <div className="ml-4">
                {renderTree(node.children, fullPath)}
              </div>
            )}
          </div>
        );
      });
  };
  
  const handleCreateFile = () => {
    const path = prompt('Enter file path (e.g., src/components/NewComponent.tsx):');
    if (path && !files[path]) {
      const content = path.endsWith('.tsx') || path.endsWith('.ts') 
        ? `// New TypeScript file\n\nexport default function NewComponent() {\n  return <div>New Component</div>;\n}`
        : path.endsWith('.jsx') || path.endsWith('.js')
        ? `// New JavaScript file\n\nexport default function NewComponent() {\n  return <div>New Component</div>;\n}`
        : `// New file`;
      
      createFile(path, content);
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-900/50 border-r border-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-300">Explorer</h3>
          <button
            onClick={handleCreateFile}
            className="p-1 hover:bg-gray-800 rounded"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs bg-gray-800/50 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {renderTree(buildTree())}
      </div>
    </div>
  );
}
