'use client';

import { useProjectStore } from '../state/project-store';
import { FileNode } from '../types/project.types';
import { ChevronRight, ChevronDown, File, Folder, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Menu, Item, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

const MENU_ID = 'file-menu';

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  onSelect: (node: FileNode) => void;
  onRename: (node: FileNode) => void;
  onDelete: (node: FileNode) => void;
  onNewFile: (node: FileNode) => void;
  onNewFolder: (node: FileNode) => void;
}

function FileTreeNode({ node, level, onSelect, onRename, onDelete, onNewFile, onNewFolder }: FileTreeNodeProps) {
  const [open, setOpen] = useState(node.isOpen || false);
  const { show } = useContextMenu({ id: MENU_ID });

  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: node,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: node.id,
    data: node,
  });

  const ref = (el: HTMLElement | null) => {
    setDraggableRef(el);
    setDroppableRef(el);
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
  } : undefined;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    show({ event: e, props: { node } });
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <div
      ref={ref}
      style={style}
      {...listeners}
      {...attributes}
      className={`group flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer rounded ${
        isOver ? 'bg-gray-600' : ''
      }`}
      onClick={() => node.type === 'folder' ? setOpen(!open) : onSelect(node)}
      onContextMenu={handleContextMenu}
    >
      <span className="w-5" onClick={toggleOpen}>
        {node.type === 'folder' && (open ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
      </span>
      <span className="mr-1">
        {node.type === 'folder' ? <Folder size={16} /> : <File size={16} />}
      </span>
      <span className="text-sm truncate flex-1">{node.name}</span>
      <button
        className="opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          show({ event: e, props: { node } });
        }}
      >
        <MoreVertical size={14} />
      </button>
    </div>
  );
}

export function FileExplorer() {
  const { files, setActiveFile } = useProjectStore();

  const handleSelect = (node: FileNode) => {
    setActiveFile(node.id);
    // Here you would also load the file content into the editor
  };

  const handleRename = (node: FileNode) => {
    const newName = prompt('Enter new name:', node.name);
    if (newName && newName !== node.name) {
      // Implement rename logic (update store and backend)
      console.log('Rename', node.id, newName);
    }
  };

  const handleDelete = (node: FileNode) => {
    if (confirm(`Delete ${node.name}?`)) {
      // useProjectStore.getState().deleteFile(node.id);
      console.log('Delete', node.id);
    }
  };

  const handleNewFile = (node: FileNode) => {
    const name = prompt('Enter file name:');
    if (name) {
      // Create file under this node if folder, else same level
      console.log('New file under', node.id, name);
    }
  };

  const handleNewFolder = (node: FileNode) => {
    const name = prompt('Enter folder name:');
    if (name) {
      console.log('New folder under', node.id, name);
    }
  };

  const handleMenuClick = ({ id, props }) => {
    const { node } = props;
    if (id === 'rename') handleRename(node);
    if (id === 'delete') handleDelete(node);
    if (id === 'newFile') handleNewFile(node);
    if (id === 'newFolder') handleNewFolder(node);
  };

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <li key={node.id}>
        <FileTreeNode
          node={node}
          level={level}
          onSelect={handleSelect}
          onRename={handleRename}
          onDelete={handleDelete}
          onNewFile={handleNewFile}
          onNewFolder={handleNewFolder}
        />
        {node.type === 'folder' && node.children && node.children.length > 0 && (
          <ul style={{ paddingLeft: 16 }}>{renderTree(node.children, level + 1)}</ul>
        )}
      </li>
    ));
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-800 text-gray-200 p-2">
      <Menu id={MENU_ID} onItemClick={handleMenuClick}>
        <Item id="newFile">New File</Item>
        <Item id="newFolder">New Folder</Item>
        <Item id="rename">Rename</Item>
        <Item id="delete">Delete</Item>
      </Menu>
      <div className="text-sm font-medium mb-2 px-2 flex justify-between items-center">
        <span>EXPLORER</span>
        <button
          className="text-xs bg-gray-700 px-2 py-1 rounded"
          onClick={() => {
            // Create root file (if no project yet)
          }}
        >
          + New
        </button>
      </div>
      <ul className="space-y-0.5">{renderTree(files)}</ul>
    </div>
  );
}
