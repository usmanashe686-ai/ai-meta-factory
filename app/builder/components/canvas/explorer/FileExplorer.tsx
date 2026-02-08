"use client";

import { useState, useRef, useEffect } from 'react';
import {
  FileText, Folder, FolderOpen, ChevronRight, ChevronDown,
  Plus, Trash2, FileCode, FileJson, FileImage, Search, 
  Edit2, Copy, FolderPlus, X, Check
} from 'lucide-react';
import { useProjectStore } from '../state/project-store';

export function FileExplorer() {
  const { 
    files, 
    activeFile, 
    setActiveFile, 
    createFile, 
    removeFile,
    renameFile,
    copyFile,
    searchFiles
  } = useProjectStore();
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'public', 'app']));
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const buildTree = () => {
    const tree: Record<string, any> = {};
    
    Object.keys(files)
      .filter(path => !path.includes('.folder-marker'))
      .forEach(path => {
        const parts = path.split('/');
        let current = tree;
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const isLast = i === parts.length - 1;
          
          if (!current[part]) {
            current[part] = { 
              type: isLast ? 'file' : 'folder',
              children: {},
              path: parts.slice(0, i + 1).join('/')
            };
          }
          
          if (!isLast) {
            current = current[part].children;
          }
        }
      });
    
    return tree;
  };

  const renderTree = (tree: Record<string, any>, depth = 0): JSX.Element[] => {
    return Object.keys(tree)
      .sort((a, b) => {
        const aIsFolder = tree[a].type === 'folder';
        const bIsFolder = tree[b].type === 'folder';
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return a.localeCompare(b);
      })
      .map(key => {
        const node = tree[key];
        const isExpanded = expandedFolders.has(node.path);
        const isRenaming = renamingPath === node.path;
        
        return (
          <div key={node.path}>
            <div
              className="flex items-center py-1 px-2 hover:bg-gray-800/50 cursor-pointer"
              style={{ paddingLeft: `${depth * 20 + 8}px` }}
              onClick={() => {
                if (node.type === 'folder') {
                  const newExpanded = new Set(expandedFolders);
                  if (isExpanded) {
                    newExpanded.delete(node.path);
                  } else {
                    newExpanded.add(node.path);
                  }
                  setExpandedFolders(newExpanded);
                } else {
                  setActiveFile(node.path);
                }
              }}
            >
              <div className="flex items-center w-4 mr-1">
                {node.type === 'folder' && (
                  isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                )}
              </div>
              
              <div className="mr-2">
                {node.type === 'folder' ? (
                  isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Folder className="w-4 h-4 text-yellow-500/70" />
                  )
                ) : (
                  getFileIcon(key)
                )}
              </div>
              
              {isRenaming ? (
                <div className="flex items-center flex-1">
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renamingName}
                    onChange={(e) => setRenamingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit();
                      if (e.key === 'Escape') setRenamingPath(null);
                    }}
                    onBlur={handleRenameSubmit}
                    className="flex-1 px-1 bg-gray-800 border border-blue-500 rounded text-sm"
                    autoFocus
                  />
                  <button onClick={handleRenameSubmit} className="ml-1 p-0.5">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => setRenamingPath(null)} className="ml-1 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="text-sm truncate flex-1">{key}</span>
              )}
              
              {!isRenaming && (
                <div className="flex items-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameStart(node.path, key);
                    }}
                    className="p-0.5 hover:bg-gray-700 rounded"
                    title="Rename"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {node.type === 'file' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(node.path);
                      }}
                      className="p-0.5 hover:bg-gray-700 rounded ml-1"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(node.path, node.type);
                    }}
                    className="p-0.5 hover:bg-gray-700 rounded ml-1"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            
            {node.type === 'folder' && isExpanded && (
              <div>
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'ts': case 'tsx': case 'js': case 'jsx':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-400" />;
      case 'css': case 'scss':
        return <FileText className="w-4 h-4 text-pink-400" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-400" />;
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg':
        return <FileImage className="w-4 h-4 text-green-400" />;
      case 'py':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'dart':
        return <FileText className="w-4 h-4 text-blue-300" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleCreateFile = () => {
    const defaultPath = 'src/components/NewComponent.tsx';
    const defaultContent = `export default function NewComponent() {
  return (
    <div>
      <h1>New Component</h1>
    </div>
  );
}`;
    
    const isCodeFile = true; // This is a code file
    createFile(defaultPath, defaultContent, isCodeFile);
  };

  const handleDelete = (path: string, type: 'file' | 'folder') => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      removeFile(path);
    }
  };

  const handleRenameStart = (path: string, currentName: string) => {
    setRenamingPath(path);
    setRenamingName(currentName);
  };

  const handleRenameSubmit = () => {
    if (renamingPath && renamingName) {
      renameFile(renamingPath, renamingPath.replace(/[^\/]+$/, renamingName));
    }
    setRenamingPath(null);
    setRenamingName('');
  };

  const handleDuplicate = (path: string) => {
    copyFile(path);
  };

  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingPath]);

  const tree = buildTree();

  return (
    <div className="h-full flex flex-col bg-gray-900/50 border-r border-gray-800">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-300">Files</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCreateFile}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs bg-gray-800/50 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {searchQuery ? (
          <div className="space-y-1">
            <div className="text-xs text-gray-400 p-2">
              Search results for "{searchQuery}"
            </div>
            {searchFiles(searchQuery).map((result) => (
              <div
                key={result.path}
                className="flex items-center py-1 px-2 hover:bg-gray-800/50 cursor-pointer rounded"
                onClick={() => setActiveFile(result.path)}
              >
                {getFileIcon(result.name)}
                <span className="text-sm ml-2 truncate">{result.name}</span>
              </div>
            ))}
          </div>
        ) : (
          renderTree(tree)
        )}
      </div>
    </div>
  );
}
