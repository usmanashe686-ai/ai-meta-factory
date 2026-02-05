"use client";

import { useState } from 'react';
import { Folder, FolderOpen, File, FileCode, FileJson, FileText, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';

interface EnhancedFileTreeProps {
  files: Record<string, string>;
  onFileSelect: (path: string) => void;
  onFileChange: (path: string, content: string) => void;
  onFileDelete: (path: string) => void;
  onFileCreate: (type: 'file' | 'folder', path: string) => void;
  onFileUpload: (files: FileList) => void;
  activeFile?: string | null;
}

export function EnhancedFileTree({
  files,
  onFileSelect,
  onFileDelete,
  onFileCreate,
  activeFile
}: EnhancedFileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': case 'ts': case 'jsx': case 'js':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-400" />;
      case 'css': case 'scss':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const buildTree = () => {
    const tree: any = {};
    
    Object.keys(files).sort().forEach(filePath => {
      const parts = filePath.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? { type: 'file', path: filePath } : { type: 'folder', children: {} };
        }
        if (index < parts.length - 1) {
          current = current[part].children;
        }
      });
    });
    
    return tree;
  };

  const renderTree = (node: any, path: string = '', depth: number = 0) => {
    const entries = Object.entries(node).sort(([a], [b]) => {
      const aIsFile = node[a].type === 'file';
      const bIsFile = node[b].type === 'file';
      if (aIsFile && !bIsFile) return 1;
      if (!aIsFile && bIsFile) return -1;
      return a.localeCompare(b);
    });

    return entries.map(([name, data]: [string, any]) => {
      const fullPath = path ? `${path}/${name}` : name;
      const isExpanded = expandedFolders.has(fullPath);
      const isActive = activeFile === fullPath;

      if (data.type === 'folder') {
        return (
          <div key={fullPath}>
            <div
              className={`flex items-center px-3 py-2 hover:bg-gray-800 cursor-pointer ${
                isActive ? 'bg-blue-900/30' : ''
              }`}
              style={{ paddingLeft: `${depth * 20 + 12}px` }}
              onClick={() => toggleFolder(fullPath)}
            >
              <button className="mr-1">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-400 mr-2" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400 mr-2" />
              )}
              <span className="text-sm">{name}</span>
            </div>
            {isExpanded && renderTree(data.children, fullPath, depth + 1)}
          </div>
        );
      } else {
        return (
          <div
            key={fullPath}
            className={`flex items-center justify-between group px-3 py-2 hover:bg-gray-800 cursor-pointer ${
              isActive ? 'bg-blue-900/30' : ''
            }`}
            style={{ paddingLeft: `${depth * 20 + 32}px` }}
            onClick={() => onFileSelect(fullPath)}
          >
            <div className="flex items-center">
              {getFileIcon(fullPath)}
              <span className="ml-2 text-sm">{name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete ${name}?`)) {
                  onFileDelete(fullPath);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded"
            >
              <Trash2 className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        );
      }
    });
  };

  const tree = buildTree();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">Files</h3>
          <button
            onClick={() => onFileCreate('file', 'new-file.tsx')}
            className="p-1 hover:bg-gray-800 rounded"
            title="New File"
          >
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {renderTree(tree)}
      </div>
    </div>
  );
}
