'use client';

import React, { useState, useCallback } from 'react';
import { useProjectStore } from '../state/project-store';
import { useDrop } from 'react-dnd';
import { FiFile, FiFolder, FiPlus, FiTrash2, FiEdit } from 'lucide-react';
import { nanoid } from 'nanoid';

export function EnhancedFileExplorer() {
  const { files, createFile, deleteFile, renameFile } = useProjectStore();
  const [selected, setSelected] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'file',
    drop: (item: any) => console.log('Dropped', item),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  const handleCreate = useCallback(() => {
    const name = prompt('Enter new file name');
    if (name) createFile(`/${name}`, '');
  }, [createFile]);

  const handleDelete = useCallback((path: string) => {
    if (confirm(`Delete ${path}?`)) deleteFile(path);
  }, [deleteFile]);

  const handleRename = useCallback((path: string) => {
    const newName = prompt('New name', path.split('/').pop());
    if (newName) renameFile(path, `/${newName}`);
  }, [renameFile]);

  return (
    <div ref={drop} className={`h-full overflow-auto p-2 ${isOver ? 'bg-gray-800' : ''}`}>
      <div className="flex justify-between mb-2">
        <span className="font-semibold">Files</span>
        <button onClick={handleCreate} className="p-1 hover:bg-gray-700 rounded"><FiPlus size={16} /></button>
      </div>
      <ul className="space-y-1 text-sm">
        {Object.keys(files).map((path) => (
          <li
            key={path}
            className={`flex items-center justify-between p-1 rounded cursor-pointer hover:bg-gray-700 ${selected===path ? 'bg-gray-700' : ''}`}
            onClick={() => setSelected(path)}
          >
            <div className="flex items-center gap-1">
              {path.endsWith('/') ? <FiFolder /> : <FiFile />}
              <span>{path.split('/').pop()}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleRename(path)}><FiEdit size={14} /></button>
              <button onClick={() => handleDelete(path)}><FiTrash2 size={14} /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
