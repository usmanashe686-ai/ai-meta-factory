'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  Plus, Search, FolderPlus, Folder, Edit2, Copy, Trash2, FileText
} from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { SortableFileItem } from './dnd/SortableFileItem';
import { FileNode } from '../types/project.types';

export function EnhancedFileExplorerDnDContent() {
  const {
    files,
    activeFileId,
    setActiveFile,
    createFile,
    deleteFile,
    renameFile,
    copyFile,
    searchFiles,
    moveFile,
  } = useProjectStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'public', 'app']));
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

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
      path,
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

  // Handler to adapt setActiveFile (expects string) to onSelect (expects FileNode)
  const handleSelect = (file: FileNode) => {
    setActiveFile(file.id);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = files.findIndex(f => f.id === active.id);
      const newIndex = files.findIndex(f => f.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        moveFile(active.id as string, over?.id as string);
      }
    }
  }

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
                <Folder className="w-4 h-4 text-yellow-500/70" />
                <span className="text-sm ml-2 truncate">{result.name}</span>
                <span className="text-xs text-gray-500 ml-2 truncate">{result.path}</span>
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {files.map((file) => (
                  <SortableFileItem
                    key={file.id}
                    file={file}
                    expandedFolders={expandedFolders}
                    onToggleFolder={handleToggleFolder}
                    onSelect={handleSelect}
                    onRenameStart={handleRenameStart}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onContextMenu={handleContextMenu}
                    isRenaming={renamingPath === file.path}
                    renamingName={renamingName}
                    onRenameSubmit={handleRenameSubmit}
                    onRenameCancel={handleRenameCancel}
                    onRenameInputChange={setRenamingName}
                    renameInputRef={renameInputRef}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
