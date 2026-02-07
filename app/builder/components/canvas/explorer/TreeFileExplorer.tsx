'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useProjectStore } from '../state/project-store';
import { Tree, NodeModel } from 'react-dnd-treeview';
import { nanoid } from 'nanoid';
import { FiFile, FiFolder, FiPlus, FiTrash2, FiEdit, FiSearch } from 'lucide-react';

export function TreeFileExplorer() {
  const { files, createFile, deleteFile, renameFile } = useProjectStore();
  const [nodes, setNodes] = useState<NodeModel[]>([]);
  const [filter, setFilter] = useState('');

  // Convert flat files to tree nodes
  useEffect(() => {
    const newNodes: NodeModel[] = Object.keys(files).map((path, index) => ({
      id: index + 1,
      parent: 0,
      droppable: path.endsWith('/'),
      text: path.split('/').pop() || '',
      data: { path },
    }));
    setNodes(newNodes);
  }, [files]);

  const handleCreate = useCallback(() => {
    const name = prompt('Enter file/folder name (end with / for folder)');
    if (!name) return;
    const path = name.endsWith('/') ? name : `/${name}`;
    createFile(path, '');
  }, [createFile]);

  const handleDelete = useCallback((node: NodeModel) => {
    if (confirm(`Delete ${node.text}?`)) deleteFile(node.data.path);
  }, [deleteFile]);

  const handleRename = useCallback((node: NodeModel) => {
    const newName = prompt('New name', node.text);
    if (!newName) return;
    const newPath = node.data.path.replace(node.text, newName);
    renameFile(node.data.path, newPath);
  }, [renameFile]);

  const handleDrop = useCallback((newTree: NodeModel[]) => {
    // Basic reorder logic; complex folder moves can be added
    setNodes(newTree);
  }, []);

  const filteredNodes = filter
    ? nodes.filter((n) => n.text.toLowerCase().includes(filter.toLowerCase()))
    : nodes;

  return (
    <div className="h-full flex flex-col p-2 overflow-auto bg-gray-900">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search files..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 outline-none text-sm w-full"
          />
        </div>
        <button onClick={handleCreate} className="p-1 hover:bg-gray-700 rounded"><FiPlus size={16} /></button>
      </div>
      <Tree
        tree={filteredNodes}
        rootId={0}
        render={(node, { depth, isOpen, onToggle }) => (
          <div
            style={{ marginLeft: depth * 16 }}
            className="flex justify-between items-center p-1 rounded hover:bg-gray-700 cursor-pointer"
          >
            <div className="flex items-center gap-1">
              {node.droppable ? <FiFolder /> : <FiFile />}
              <span>{node.text}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleRename(node)}><FiEdit size={14} /></button>
              <button onClick={() => handleDelete(node)}><FiTrash2 size={14} /></button>
            </div>
          </div>
        )}
        dragPreviewRender={(monitorProps) => (
          <div className="p-1 bg-gray-700 rounded text-sm">{monitorProps.item.text}</div>
        )}
        onDrop={handleDrop}
      />
    </div>
  );
}
