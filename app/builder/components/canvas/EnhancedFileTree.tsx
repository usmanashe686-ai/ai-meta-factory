"use client";

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import {
  Folder, FolderOpen, File, FileCode, FileText, FileJson,
  FileImage, Database, Settings, Package, Trash2, Copy,
  Edit, FolderPlus, FilePlus, GitBranch, RefreshCw, Download
} from 'lucide-react';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
}

interface EnhancedFileTreeProps {
  files: Record<string, string>;
  selectedFile: string | null;
  onFileSelect: (filePath: string) => void;
  onFilesChange: (files: Record<string, string>) => void;
  onFileContentChange: (filePath: string, content: string) => void;
  onFileDelete: (filePath: string) => void;
  onFileCreate: (filePath: string, isFolder: boolean) => void;
  onFileRename: (oldPath: string, newPath: string) => void;
}

interface SortableFileNodeProps {
  node: FileNode;
  depth: number;
  selectedFile: string | null;
  onFileSelect: (filePath: string) => void;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
}

function SortableFileNode({
  node,
  depth,
  selectedFile,
  onFileSelect,
  expandedFolders,
  onToggleExpand
}: SortableFileNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const isExpanded = node.type === 'folder' && expandedFolders.has(node.id);
  const isSelected = node.type === 'file' && selectedFile === node.path;

  const getFileIcon = () => {
    const ext = node.name.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4";
    
    if (node.type === 'folder') {
      return isExpanded ? 
        <FolderOpen className={\`\${iconClass} text-blue-400\`} /> :
        <Folder className={\`\${iconClass} text-blue-400\`} />;
    }
    
    switch (ext) {
      case 'ts': case 'tsx': 
        return <FileCode className={\`\${iconClass} text-blue-500\`} />;
      case 'js': case 'jsx': 
        return <FileCode className={\`\${iconClass} text-yellow-500\`} />;
      case 'json':
        return <FileJson className={\`\${iconClass} text-yellow-600\`} />;
      case 'css': case 'scss': case 'sass':
        return <FileText className={\`\${iconClass} text-purple-500\`} />;
      case 'html': case 'htm':
        return <FileText className={\`\${iconClass} text-orange-500\`} />;
      case 'md':
        return <FileText className={\`\${iconClass} text-blue-400\`} />;
      case 'py':
        return <FileCode className={\`\${iconClass} text-green-500\`} />;
      case 'java':
        return <FileCode className={\`\${iconClass} text-red-500\`} />;
      case 'yml': case 'yaml':
        return <Settings className={\`\${iconClass} text-cyan-500\`} />;
      case 'svg': case 'png': case 'jpg': case 'jpeg': case 'gif':
        return <FileImage className={\`\${iconClass} text-green-400\`} />;
      case 'db': case 'sql':
        return <Database className={\`\${iconClass} text-teal-500\`} />;
      default:
        return <File className={\`\${iconClass} text-gray-500\`} />;
    }
  };

  const handleClick = () => {
    if (node.type === 'folder') {
      onToggleExpand(node.id);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        paddingLeft: \`\${depth * 20 + 12}px\`
      }}
      className="relative group"
    >
      <ContextMenuTrigger id={\`file-context-\${node.id}\`}>
        <div
          {...attributes}
          {...listeners}
          onClick={handleClick}
          className={\`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-800 transition-colors select-none \${
            isSelected ? 'bg-blue-900/30 border-r-2 border-blue-500' : ''
          } \${isDragging ? 'shadow-lg bg-gray-800' : ''}\`}
        >
          <div className="flex items-center flex-1">
            {getFileIcon()}
            <span className={\`ml-2 text-sm truncate \${
              isSelected ? 'text-white font-medium' : 'text-gray-300'
            }\`}>
              {node.name}
            </span>
          </div>
          
          {node.type === 'file' && node.content && (
            <span className="text-xs text-gray-500 ml-2">
              {node.content.split('\\n').length} lines
            </span>
          )}
        </div>
      </ContextMenuTrigger>

      {/* Context Menu */}
      <ContextMenu id={\`file-context-\${node.id}\`}>
        {node.type === 'folder' ? (
          <>
            <MenuItem onClick={() => {/* New File */}}>
              <FilePlus className="w-4 h-4 mr-2" />
              New File
            </MenuItem>
            <MenuItem onClick={() => {/* New Folder */}}>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </MenuItem>
            <MenuItem divider />
          </>
        ) : (
          <>
            <MenuItem onClick={() => {/* Edit */}}>
              <Edit className="w-4 h-4 mr-2" />
              Rename
            </MenuItem>
            <MenuItem onClick={() => {/* Copy */}}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </MenuItem>
            <MenuItem divider />
          </>
        )}
        <MenuItem onClick={() => {/* Delete */}} className="text-red-400">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </MenuItem>
      </ContextMenu>
    </div>
  );
}

export default function EnhancedFileTree({
  files,
  selectedFile,
  onFileSelect,
  onFilesChange,
  onFileContentChange,
  onFileDelete,
  onFileCreate,
  onFileRename
}: EnhancedFileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<FileNode | null>(null);
  const [flatNodes, setFlatNodes] = useState<FileNode[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  // Convert flat files to tree structure
  const buildFileTree = useCallback(() => {
    const tree: FileNode[] = [];
    const nodes = new Map<string, FileNode>();

    Object.keys(files).sort().forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const isFile = i === parts.length - 1;
        const name = parts[i];
        currentPath = currentPath ? \`\${currentPath}/\${name}\` : name;

        if (!nodes.has(currentPath)) {
          const node: FileNode = {
            id: currentPath,
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

    // Flatten nodes for DnD
    const flat: FileNode[] = [];
    const flatten = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        flat.push(node);
        if (node.type === 'folder' && expandedFolders.has(node.id)) {
          flatten(node.children || []);
        }
      });
    };
    flatten(tree);
    setFlatNodes(flat);

    return tree;
  }, [files, expandedFolders]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = flatNodes.find(n => n.id === active.id);
    setDraggedItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = flatNodes.findIndex(item => item.id === active.id);
      const newIndex = flatNodes.findIndex(item => item.id === over.id);

      const newFlatNodes = arrayMove(flatNodes, oldIndex, newIndex);
      setFlatNodes(newFlatNodes);

      // TODO: Update actual file structure based on new order
    }

    setDraggedItem(null);
  };

  const handleToggleExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <SortableFileNode
          node={node}
          depth={depth}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          expandedFolders={expandedFolders}
          onToggleExpand={handleToggleExpand}
        />
        
        {node.type === 'folder' && expandedFolders.has(node.id) && node.children && (
          <SortableContext items={node.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {renderTree(node.children, depth + 1)}
          </SortableContext>
        )}
      </div>
    ));
  };

  const tree = buildFileTree();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilePlus
                className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer"
                onClick={() => onFileCreate('new-file.ts', false)}
              />
              <FolderPlus
                className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer"
                onClick={() => onFileCreate('new-folder', true)}
              />
              <RefreshCw
                className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer"
                onClick={() => setExpandedFolders(new Set())}
              />
            </div>
            <span className="text-xs text-gray-500">
              {Object.keys(files).length} files
            </span>
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-auto p-2">
          <SortableContext items={flatNodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
            {tree.length > 0 ? (
              renderTree(tree)
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No files in project
              </div>
            )}
          </SortableContext>
        </div>

        <DragOverlay>
          {draggedItem && (
            <div className="bg-gray-800 border border-blue-500 rounded shadow-lg p-2">
              <div className="flex items-center">
                {draggedItem.type === 'folder' ? (
                  <Folder className="w-4 h-4 text-blue-400 mr-2" />
                ) : (
                  <File className="w-4 h-4 text-gray-400 mr-2" />
                )}
                <span className="text-sm text-white">{draggedItem.name}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
