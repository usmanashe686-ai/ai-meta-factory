"use client";

import { useState } from 'react';
import { 
  FileText, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Trash2,
  FileCode,
  FileJson,
  File,
  FileImage,
  FileType
} from 'lucide-react';

interface EnhancedFileTreeProps {
  files: Record<string, string>;
  onFileSelect: (path: string) => void;
  onFileChange: (path: string, content: string) => void;
  onFileDelete: (path: string) => void;
  onFileCreate: (type: 'file' | 'folder', path: string) => void;
  activeFile: string | null;
}

export function EnhancedFileTree({
  files,
  onFileSelect,
  onFileDelete,
  onFileCreate,
  activeFile
}: EnhancedFileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileTree = () => {
    const tree: Record<string, any> = {};
    
    Object.keys(files).forEach(path => {
      const parts = path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = { type: 'file', path };
        } else {
          if (!current[part]) {
            current[part] = { type: 'folder', children: {} };
          }
          current = current[part].children;
        }
      });
    });
    
    return tree;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'ts':
      case 'js':
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-green-400" />;
      case 'css':
      case 'scss':
      case 'sass':
        return <FileText className="w-4 h-4 text-pink-400" />;
      case 'md':
      case 'txt':
        return <FileType className="w-4 h-4 text-gray-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
        return <FileImage className="w-4 h-4 text-purple-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderTree = (node: Record<string, any>, path = '', depth = 0): JSX.Element[] => {
    const entries = Object.entries(node);
    
    return entries.map(([name, item]) => {
      const currentPath = path ? `${path}/${name}` : name;
      
      if (item.type === 'folder') {
        const isExpanded = expandedFolders.has(currentPath);
        
        return (
          <div key={currentPath}>
            <div
              className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                hoveredFile === currentPath ? 'bg-gray-800/50' : 'hover:bg-gray-800/30'
              }`}
              onClick={() => toggleFolder(currentPath)}
              onMouseEnter={() => setHoveredFile(currentPath)}
              onMouseLeave={() => setHoveredFile(null)}
              style={{ paddingLeft: `${depth * 16 + 12}px` }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isExpanded ? 
                  <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" /> : 
                  <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                }
                {isExpanded ? 
                  <FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" /> : 
                  <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
                }
                <span className="text-sm text-gray-300 truncate">{name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileCreate('file', `${currentPath}/NewFile.tsx`);
                  }}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            {isExpanded && (
              <div>
                {renderTree(item.children, currentPath, depth + 1)}
              </div>
            )}
          </div>
        );
      } else {
        const isActive = activeFile === currentPath;
        
        return (
          <div
            key={currentPath}
            className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all group ${
              isActive 
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                : hoveredFile === currentPath ? 'bg-gray-800/50' : 'hover:bg-gray-800/30'
            }`}
            onClick={() => onFileSelect(currentPath)}
            onMouseEnter={() => setHoveredFile(currentPath)}
            onMouseLeave={() => setHoveredFile(null)}
            style={{ paddingLeft: `${depth * 16 + 28}px` }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getFileIcon(name)}
              <span className={`text-sm truncate ${isActive ? 'font-semibold text-white' : 'text-gray-300'}`}>
                {name}
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${name}?`)) {
                    onFileDelete(currentPath);
                  }
                }}
                className="p-1 hover:bg-red-500/20 rounded"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>
          </div>
        );
      }
    });
  };

  const tree = getFileTree();

  return (
    <div className="h-full flex flex-col">
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {renderTree(tree)}
      </div>
      
      {/* Add File Button */}
      <div className="p-3 border-t border-gray-800/50">
        <button
          onClick={() => onFileCreate('file', `src/components/NewComponent.tsx`)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add New File</span>
        </button>
      </div>
    </div>
  );
}
