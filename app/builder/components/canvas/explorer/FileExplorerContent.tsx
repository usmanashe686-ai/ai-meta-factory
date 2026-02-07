"use client";

import { useState, useRef, useEffect } from 'react';
import {
  FileText, Folder, FolderOpen, ChevronRight, ChevronDown,
  Plus, Trash2, FileCode, FileJson, FileImage, Search, 
  MoreVertical, Edit2, Copy, FolderPlus, X, Check,
  Type, File, FileType
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { useProjectStore } from '../state/project-store';

interface DragItem {
  type: string;
  path: string;
  name: string;
  isFolder: boolean;
}

const ItemTypes = {
  FILE: 'file',
  FOLDER: 'folder'
};

const DraggableFileItem: React.FC<{
  name: string;
  path: string;
  isFolder: boolean;
  isExpanded: boolean;
  depth: number;
  onToggle: () => void;
  onClick: () => void;
  onRename: (oldPath: string, newName: string) => void;
  onDelete: (path: string, isFolder: boolean) => void;
  onDuplicate: (path: string) => void;
  isRenaming: boolean;
  renamingName: string;
  onStartRename: () => void;
  onFinishRename: () => void;
  onCancelRename: () => void;
  onRenamingNameChange: (name: string) => void;
}> = ({
  name,
  path,
  isFolder,
  isExpanded,
  depth,
  onToggle,
  onClick,
  onRename,
  onDelete,
  onDuplicate,
  isRenaming,
  renamingName,
  onStartRename,
  onFinishRename,
  onCancelRename,
  onRenamingNameChange
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: isFolder ? ItemTypes.FOLDER : ItemTypes.FILE,
    item: { type: isFolder ? ItemTypes.FOLDER : ItemTypes.FILE, path, name, isFolder },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [path, name, isFolder]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.FILE, ItemTypes.FOLDER],
    drop: (item: DragItem) => {
      if (isFolder && item.path !== path) {
        // Move item to this folder
        const newPath = path.endsWith('/') ? `${path}${item.name}` : `${path}/${item.name}`;
        onRename(item.path, newPath);
      }
    },
    canDrop: (item: DragItem) => {
      return isFolder && item.path !== path;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [isFolder, path]);

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

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center py-1 px-2 hover:bg-gray-800/50 cursor-pointer ${isDragging ? 'opacity-50' : ''} ${isOver && canDrop ? 'bg-blue-500/20' : ''}`}
      style={{ paddingLeft: `${depth * 20 + 8}px` }}
    >
      <div 
        className="flex items-center w-4 mr-1"
        onClick={(e) => {
          e.stopPropagation();
          if (isFolder) onToggle();
        }}
      >
        {isFolder && (
          isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
        )}
      </div>
      
      <div 
        className="mr-2"
        onClick={() => {
          if (isFolder) onToggle();
          else onClick();
        }}
      >
        {isFolder ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-yellow-500" />
          ) : (
            <Folder className="w-4 h-4 text-yellow-500/70" />
          )
        ) : (
          getFileIcon(name)
        )}
      </div>
      
      {isRenaming ? (
        <div className="flex items-center flex-1">
          <input
            type="text"
            value={renamingName}
            onChange={(e) => onRenamingNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onFinishRename();
              if (e.key === 'Escape') onCancelRename();
            }}
            onBlur={onFinishRename}
            className="flex-1 px-1 bg-gray-800 border border-blue-500 rounded text-sm"
            autoFocus
          />
          <button onClick={onFinishRename} className="ml-1 p-0.5">
            <Check className="w-3 h-3" />
          </button>
          <button onClick={onCancelRename} className="ml-1 p-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <span 
          className="text-sm truncate flex-1"
          onClick={() => {
            if (isFolder) onToggle();
            else onClick();
          }}
        >
          {name}
        </span>
      )}
      
      {!isRenaming && (
        <div className="flex items-center opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartRename();
            }}
            className="p-0.5 hover:bg-gray-700 rounded"
            title="Rename"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          {!isFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(path);
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
              onDelete(path, isFolder);
            }}
            className="p-0.5 hover:bg-gray-700 rounded ml-1"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export function FileExplorerContent() {
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
            <DraggableFileItem
              name={key}
              path={node.path}
              isFolder={node.type === 'folder'}
              isExpanded={isExpanded}
              depth={depth}
              onToggle={() => {
                const newExpanded = new Set(expandedFolders);
                if (isExpanded) {
                  newExpanded.delete(node.path);
                } else {
                  newExpanded.add(node.path);
                }
                setExpandedFolders(newExpanded);
              }}
              onClick={() => {
                if (node.type === 'file') {
                  setActiveFile(node.path);
                }
              }}
              onRename={renameFile}
              onDelete={removeFile}
              onDuplicate={copyFile}
              isRenaming={isRenaming}
              renamingName={renamingName}
              onStartRename={() => {
                setRenamingPath(node.path);
                setRenamingName(key);
              }}
              onFinishRename={() => {
                if (renamingPath && renamingName) {
                  renameFile(renamingPath, renamingPath.replace(/[^\/]+$/, renamingName));
                }
                setRenamingPath(null);
                setRenamingName('');
              }}
              onCancelRename={() => {
                setRenamingPath(null);
                setRenamingName('');
              }}
              onRenamingNameChange={setRenamingName}
            />
            {node.type === 'folder' && isExpanded && (
              <div>
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
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
          renderTree(tree)
        )}
      </div>
    </div>
  );
}
