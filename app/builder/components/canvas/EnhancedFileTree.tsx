"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Folder, FolderOpen, File, FileText, FileCode, FileJson, 
  FileImage, Database, Settings, Trash2, Edit, Copy, 
  MoreVertical, Plus, Upload, Download, ChevronRight, ChevronDown,
  GitBranch, Zap, RefreshCw
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

interface EnhancedFileTreeProps {
  files: Record<string, string>;
  onFileSelect: (path: string) => void;
  onFileChange: (path: string, content: string) => void;
  onFileDelete: (path: string) => void;
  onFileCreate: (type: 'file' | 'folder', path: string) => void;
  onFileUpload: (files: FileList) => void;
  activeFile?: string | null;
  onFilesReordered?: (files: Record<string, string>) => void;
}

export const EnhancedFileTree: React.FC<EnhancedFileTreeProps> = ({
  files,
  onFileSelect,
  onFileChange,
  onFileDelete,
  onFileCreate,
  onFileUpload,
  activeFile,
  onFilesReordered
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: FileNode | null;
  }>({ x: 0, y: 0, node: null });
  const [draggingNode, setDraggingNode] = useState<FileNode | null>(null);
  const [dragOverNode, setDragOverNode] = useState<FileNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build file tree from flat files object
  useEffect(() => {
    const tree: FileNode[] = [];
    const nodes = new Map<string, FileNode>();
    
    Object.keys(files).sort().forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';
      
      for (let i = 0; i < parts.length; i++) {
        const isFile = i === parts.length - 1;
        const name = parts[i];
        currentPath = currentPath ? `${currentPath}/${name}` : name;
        
        if (!nodes.has(currentPath)) {
          const node: FileNode = {
            id: `node-${Date.now()}-${Math.random()}`,
            name,
            type: isFile ? 'file' : 'folder',
            path: currentPath,
            content: isFile ? files[currentPath] : undefined,
            children: []
          };
          nodes.set(currentPath, node);
          
          const parentPath = parts.slice(0, i).join('/');
          if (i === 0) {
            tree.push(node);
          } else {
            const parent = nodes.get(parentPath);
            if (parent) {
              parent.children!.push(node);
              parent.children!.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
              });
            }
          }
        }
      }
    });
    
    setFileTree(tree);
  }, [files]);

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'folder') {
      return expandedFolders.has(node.path) ? 
        <FolderOpen className="w-4 h-4 text-blue-400" /> : 
        <Folder className="w-4 h-4 text-blue-400" />;
    }
    
    const ext = node.name.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4";
    
    switch (ext) {
      case 'ts': case 'tsx': 
        return <FileCode className={`${iconClass} text-blue-500`} />;
      case 'js': case 'jsx': 
        return <FileCode className={`${iconClass} text-yellow-500`} />;
      case 'json':
        return <FileJson className={`${iconClass} text-yellow-600`} />;
      case 'css': case 'scss': case 'sass':
        return <FileText className={`${iconClass} text-purple-500`} />;
      case 'html': case 'htm':
        return <FileText className={`${iconClass} text-orange-500`} />;
      case 'md':
        return <FileText className={`${iconClass} text-blue-400`} />;
      case 'svg': case 'png': case 'jpg': case 'jpeg': case 'gif':
        return <FileImage className={`${iconClass} text-green-400`} />;
      case 'db': case 'sql':
        return <Database className={`${iconClass} text-teal-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleClick = (node: FileNode) => {
    if (node.type === 'folder') {
      const newExpanded = new Set(expandedFolders);
      if (newExpanded.has(node.path)) {
        newExpanded.delete(node.path);
      } else {
        newExpanded.add(node.path);
      }
      setExpandedFolders(newExpanded);
    } else {
      onFileSelect(node.path);
    }
  };

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    e.dataTransfer.setData('text/plain', node.path);
    setDraggingNode(node);
  };

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    e.preventDefault();
    if (node.type === 'folder' && node.path !== draggingNode?.path) {
      setDragOverNode(node);
    }
  };

  const handleDragLeave = () => {
    setDragOverNode(null);
  };

  const handleDrop = (e: React.DragEvent, targetNode: FileNode) => {
    e.preventDefault();
    const sourcePath = e.dataTransfer.getData('text/plain');
    
    if (sourcePath && targetNode.type === 'folder') {
      // Move file to new location
      const newFiles = { ...files };
      const content = newFiles[sourcePath];
      delete newFiles[sourcePath];
      
      const newPath = `${targetNode.path}/${sourcePath.split('/').pop()}`;
      newFiles[newPath] = content;
      
      if (onFilesReordered) {
        onFilesReordered(newFiles);
      }
    }
    
    setDraggingNode(null);
    setDragOverNode(null);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => {
      const isActive = node.type === 'file' && activeFile === node.path;
      const isExpanded = node.type === 'folder' && expandedFolders.has(node.path);
      const isDragOver = dragOverNode?.path === node.path;
      
      return (
        <div key={node.path}>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, node)}
            onDragOver={(e) => handleDragOver(e, node)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, node)}
            onContextMenu={(e) => handleContextMenu(e, node)}
            onClick={() => handleClick(node)}
            className={`
              flex items-center px-4 py-2 cursor-pointer transition-colors
              ${isActive ? 'bg-blue-900/30 border-r-2 border-blue-500' : 'hover:bg-gray-800'}
              ${isDragOver ? 'bg-green-900/20 border-2 border-green-500 border-dashed' : ''}
            `}
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
          >
            <div className="flex items-center flex-1">
              {node.type === 'folder' && (
                <span className="mr-1">
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  )}
                </span>
              )}
              
              <span className="mr-2">
                {getFileIcon(node)}
              </span>
              
              <span className={`text-sm truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                {node.name}
              </span>
            </div>
            
            {node.type === 'file' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(node.path);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-3 h-3 text-gray-500 hover:text-gray-300" />
              </button>
            )}
          </div>
          
          {node.type === 'folder' && isExpanded && node.children && node.children.length > 0 && (
            <div>
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const contextMenuItems = [
    { label: 'Rename', icon: <Edit className="w-4 h-4" />, action: () => {} },
    { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, action: () => {} },
    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, action: () => {
      if (contextMenu.node) {
        onFileDelete(contextMenu.node.path);
      }
    }},
    { label: 'New File', icon: <File className="w-4 h-4" />, action: () => {
      if (contextMenu.node && contextMenu.node.type === 'folder') {
        onFileCreate('file', contextMenu.node.path + '/new-file.tsx');
      }
    }},
    { label: 'New Folder', icon: <Folder className="w-4 h-4" />, action: () => {
      if (contextMenu.node && contextMenu.node.type === 'folder') {
        onFileCreate('folder', contextMenu.node.path + '/new-folder');
      }
    }},
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-300">Project Files</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onFileCreate('file', 'src/new-component.tsx')}
              className="p-1 hover:bg-gray-800 rounded"
              title="New File"
            >
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => onFileCreate('folder', 'src/new-folder')}
              className="p-1 hover:bg-gray-800 rounded"
              title="New Folder"
            >
              <Folder className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={handleFileUpload}
              className="p-1 hover:bg-gray-800 rounded"
              title="Upload Files"
            >
              <Upload className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <div className="text-xs text-gray-500">
            {Object.keys(files).length} files • Drag to reorganize
          </div>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-2">
        {fileTree.length > 0 ? (
          renderTree(fileTree)
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No files yet</p>
            <p className="text-xs mt-1">Add files or generate components</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-800 bg-gray-900">
        <div className="space-y-2">
          <button
            onClick={handleFileUpload}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
          
          <div className="text-xs text-gray-500 text-center">
            Drag files here or click to upload
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleUploadChange}
        className="hidden"
      />

      {/* Context Menu */}
      {contextMenu.node && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu({ x: 0, y: 0, node: null })}
        >
          {contextMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
