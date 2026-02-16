"use client";

import { useState, useRef, useEffect } from 'react';
import {
  FileText, Folder, FolderOpen, ChevronRight, ChevronDown,
  Plus, Trash2, FileCode, FileJson, FileImage, Search,
  MoreVertical, Edit2, Copy, FolderPlus, X, Check,
  Type, File, FileType
} from 'lucide-react';
import { useProjectStore } from '../state/project-store';

interface FileItem {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'folder';
}

export function EnhancedFileExplorerDnDContent() {
  const {
    files,
    activeFileId,
    setActiveFile,
    createFile,
    deleteFile, // rename from removeFile
    renameFile,
    copyFile,
    searchFiles
  } = useProjectStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'public', 'app']));
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, path: string} | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const buildFileTree = (): FileItem[] => {
    const items: FileItem[] = [];

    // Since files is an array of FileNode, we can map directly
    files.forEach(node => {
      items.push({
        id: node.id,
        path: node.path,
        name: node.name,
        type: node.type
      });
    });

    return items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
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

    createFile(defaultPath, defaultContent, false);
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const folderPath = `src/${folderName}/.folder-marker`;
      createFile(folderPath, '', false);

      const newExpanded = new Set(expandedFolders);
      newExpanded.add(`src/${folderName}`);
      setExpandedFolders(newExpanded);
    }
  };

  const handleDelete = (path: string, type: 'file' | 'folder') => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      deleteFile(path);
    }
  };

  const handleRenameStart = (path: string, currentName: string) => {
    setRenamingPath(path);
    setRenamingName(currentName);
  };

  const handleRenameSubmit = () => {
    if (renamingPath && renamingName) {
      const newPath = renamingPath.replace(/[^\/]+$/, renamingName);
      renameFile(renamingPath, newPath);
    }
    setRenamingPath(null);
    setRenamingName('');
  };

  const handleRenameCancel = () => {
    setRenamingPath(null);
    setRenamingName('');
  };

  const handleDuplicate = (path: string) => {
    copyFile(path);
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

  const handleToggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
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
        return <FileType className="w-4 h-4 text-green-400" />;
      case 'dart':
        return <File className="w-4 h-4 text-blue-300" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
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

  const fileItems = buildFileTree();

  return (
    <div className="h-full flex flex-col bg-gray-900/50 border-r border-gray-800">
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
                {result.path.endsWith('/') ? (
                  <Folder className="w-4 h-4 text-yellow-500/70" />
                ) : (
                  <FileText className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm ml-2 truncate">{result.name}</span>
                <span className="text-xs text-gray-500 ml-2 truncate">{result.path}</span>
              </div>
            ))}
          </div>
        ) : (
          fileItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center py-1 px-2 hover:bg-gray-800/50 cursor-pointer group"
              onContextMenu={(e) => handleContextMenu(e, item.path, item.type)}
              onClick={() => {
                if (item.type === 'folder') {
                  handleToggleFolder(item.path);
                } else {
                  setActiveFile(item.id);
                }
              }}
            >
              <div className="flex items-center w-4 mr-1">
                {item.type === 'folder' && (
                  expandedFolders.has(item.path) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )
                )}
              </div>

              <div className="mr-2">
                {item.type === 'folder' ? (
                  expandedFolders.has(item.path) ? (
                    <FolderOpen className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Folder className="w-4 h-4 text-yellow-500/70" />
                  )
                ) : (
                  getFileIcon(item.name)
                )}
              </div>

              {renamingPath === item.path ? (
                <div className="flex items-center flex-1">
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renamingName}
                    onChange={(e) => setRenamingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit();
                      if (e.key === 'Escape') handleRenameCancel();
                    }}
                    onBlur={handleRenameSubmit}
                    className="flex-1 px-1 bg-gray-800 border border-blue-500 rounded text-sm"
                    autoFocus
                  />
                  <button onClick={handleRenameSubmit} className="ml-1 p-0.5">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={handleRenameCancel} className="ml-1 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="text-sm truncate flex-1">{item.name}</span>
              )}

              {renamingPath !== item.path && (
                <div className="flex items-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameStart(item.path, item.name);
                    }}
                    className="p-0.5 hover:bg-gray-700 rounded"
                    title="Rename"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {item.type === 'file' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(item.path);
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
                      handleDelete(item.path, item.type);
                    }}
                    className="p-0.5 hover:bg-gray-700 rounded ml-1"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

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
              handleDuplicate(contextMenu.path);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"
          >
            <Copy className="w-3 h-3" /> Duplicate
          </button>
          <button
            onClick={() => {
              const type = contextMenu.path.endsWith('/') ? 'folder' : 'file';
              handleDelete(contextMenu.path, type);
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
