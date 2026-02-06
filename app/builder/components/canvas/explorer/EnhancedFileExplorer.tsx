"use client";

import { useState, useRef, useEffect } from 'react';
import {
  FileText, Folder, FolderOpen, ChevronRight, ChevronDown,
  Plus, Trash2, FileCode, FileJson, FileImage, Search, 
  MoreVertical, Edit2, Copy, FolderPlus, X, Check
} from 'lucide-react';
import { useProjectStore } from '../state/project-store';

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children: TreeNode[];
}

export function EnhancedFileExplorer() {
  const { files, setActiveFile, createFile, deleteFile, renameFile, activeFile } = useProjectStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'public', 'app']));
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, path: string} | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Build tree structure from flat files
  const buildFileTree = (): TreeNode[] => {
    const root: TreeNode[] = [];
    const pathMap = new Map<string, TreeNode>();
    
    // Sort files alphabetically
    const sortedFiles = Object.keys(files)
      .sort();
    
    // Build tree
    sortedFiles.forEach(path => {
      const parts = path.split('/');
      let currentPath = '';
      let currentNode: TreeNode | null = null;
      
      for (let i = 0; i < parts.length; i++) {
        const isFile = i === parts.length - 1;
        const name = parts[i];
        currentPath = currentPath ? `${currentPath}/${name}` : name;
        
        if (isFile) {
          // Add file node
          const fileNode: TreeNode = {
            name,
            type: 'file',
            path: currentPath,
            children: []
          };
          
          if (currentNode) {
            currentNode.children.push(fileNode);
          } else {
            root.push(fileNode);
          }
        } else {
          // Add or find folder node
          let folderNode = pathMap.get(currentPath);
          
          if (!folderNode) {
            folderNode = {
              name,
              type: 'folder',
              path: currentPath + '/',
              children: []
            };
            pathMap.set(currentPath, folderNode);
            
            if (currentNode) {
              currentNode.children.push(folderNode);
            } else {
              root.push(folderNode);
            }
          }
          
          currentNode = folderNode;
        }
      }
    });
    
    // Sort each level: folders first, then files
    const sortTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      }).map(node => ({
        ...node,
        children: sortTree(node.children)
      }));
    };
    
    return sortTree(root);
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
    
    try {
      createFile(defaultPath, defaultContent);
      setActiveFile(defaultPath);
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      try {
        // Create a folder by creating a placeholder file
        createFile(`src/${folderName}/.placeholder`, '');
      } catch (error) {
        console.error('Failed to create folder:', error);
      }
    }
  };

  const handleDelete = (path: string, type: 'file' | 'folder') => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        deleteFile(path);
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const handleRenameStart = (path: string, currentName: string) => {
    setRenamingPath(path);
    setRenamingName(currentName);
  };

  const handleRenameSubmit = () => {
    if (renamingPath && renamingName) {
      try {
        const isFolder = renamingPath.endsWith('/');
        const oldPath = renamingPath;
        const newPath = isFolder 
          ? renamingPath.replace(/[^/]+(?=\/$)/, renamingName)
          : renamingPath.replace(/[^/]+$/, renamingName);
        
        renameFile(oldPath, newPath);
      } catch (error) {
        console.error('Failed to rename:', error);
      }
    }
    setRenamingPath(null);
    setRenamingName('');
  };

  const handleContextMenu = (e: React.MouseEvent, path: string, type: 'file' | 'folder') => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      path
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
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isRenaming = renamingPath === node.path;
      const isActive = activeFile === node.path;
      
      return (
        <div key={node.path} className="select-none">
          <div
            className={`flex items-center py-1 px-2 hover:bg-gray-800/50 cursor-pointer ${depth > 0 ? `ml-${depth * 4}` : ''} ${isActive ? 'bg-blue-500/10 border-r-2 border-blue-500' : ''}`}
            onContextMenu={(e) => handleContextMenu(e, node.path, node.type)}
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
            {/* Indentation */}
            <div className="flex items-center w-4 mr-1">
              {node.type === 'folder' && (
                isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
              )}
            </div>
            
            {/* Icon */}
            <div className="mr-2">
              {node.type === 'folder' ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Folder className="w-4 h-4 text-yellow-500/70" />
                )
              ) : (
                getFileIcon(node.name)
              )}
            </div>
            
            {/* Name */}
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
              <span className="text-sm truncate flex-1">{node.name}</span>
            )}
            
            {/* Actions */}
            {!isRenaming && (
              <div className="flex items-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameStart(node.path, node.name);
                  }}
                  className="p-0.5 hover:bg-gray-700 rounded"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(node.path, node.type);
                  }}
                  className="p-0.5 hover:bg-gray-700 rounded ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* Children */}
          {node.type === 'folder' && isExpanded && node.children.length > 0 && (
            <div className="ml-4">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingPath]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fileTree = buildFileTree();

  return (
    <div className="h-full flex flex-col bg-gray-900/50 border-r border-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-300">Explorer</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCreateFolder}
              className="p-1 hover:bg-gray-800 rounded"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
            <button
              onClick={handleCreateFile}
              className="p-1 hover:bg-gray-800 rounded"
              title="New File"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
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
        {searchQuery ? (
          <div className="text-xs text-gray-400 p-2">
            Search results for "{searchQuery}"
          </div>
        ) : (
          renderTree(fileTree)
        )}
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-700 rounded shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              const fileName = contextMenu.path.split('/').pop() || '';
              handleRenameStart(contextMenu.path, fileName);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"
          >
            <Edit2 className="w-3 h-3" /> Rename
          </button>
          <button
            onClick={() => {
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"
          >
            <Copy className="w-3 h-3" /> Duplicate
          </button>
          <button
            onClick={() => {
              handleDelete(contextMenu.path, 'file');
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2 text-red-400"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
