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
  Plus, Search, FolderPlus, Folder, Edit2, Copy, Trash2, Upload
} from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { SortableFileItem } from './dnd/SortableFileItem';
import { FileNode } from '../types/project.types';

export function EnhancedFileExplorerDnDContent() {
  const {
    files,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
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

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFileContent(file);
      const filePath = `src/${file.name}`;
      createFile(filePath, content, false);
      console.log(`Imported file: ${filePath}`);
    } catch (error) {
      console.error('Failed to import file:', error);
    }
    event.target.value = '';
  };

  const handleImportFolder = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = file.webkitRelativePath;
      if (relativePath) {
        try {
          const content = await readFileContent(file);
          const targetPath = `src/${relativePath}`;
          createFile(targetPath, content, false);
          const pathParts = targetPath.split('/');
          let currentPath = '';
          for (let j = 1; j < pathParts.length - 1; j++) {
            currentPath += (currentPath ? '/' : '') + pathParts[j];
            setExpandedFolders(prev => new Set(prev).add(currentPath));
          }
        } catch (error) {
          console.error(`Failed to import file ${relativePath}:`, error);
        }
      }
    }
    console.log(`Imported folder with ${files.length} files`);
    event.target.value = '';
  };

  const handleCreateFile = () => {
    const defaultPath = `src/components/NewComponent-${Date.now()}.tsx`;
    const defaultContent = `export default function NewComponent() {\n  return <div>New Component</div>;\n}`;
    createFile(defaultPath, defaultContent, false);
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const folderPath = `src/${folderName}/.folder-marker`;
      createFile(folderPath, '', true);
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

  const handleDuplicate = (path: string) => copyFile(path);

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, path });
  };

  const handleToggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) newExpanded.delete(path);
    else newExpanded.add(path);
    setExpandedFolders(newExpanded);
  };

  const handleSelect = (file: FileNode) => setActiveFile(file.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      moveFile(active.id as string, over?.id as string);
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900/50 border-r border-gray-800">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-300">Explorer</h3>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="p-1 hover:bg-gray-800 rounded" 
              title="Import File"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button 
              onClick={() => folderInputRef.current?.click()} 
              className="p-1 hover:bg-gray-800 rounded" 
              title="Import Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
            <button onClick={handleCreateFile} className="p-1 hover:bg-gray-800 rounded" title="New File">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs bg-gray-800/50 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        style={{ display: 'none' }}
        accept="*/*"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleImportFolder}
        style={{ display: 'none' }}
        // @ts-ignore
        webkitdirectory=""
        directory=""
      />

      <div className="flex-1 overflow-y-auto p-2">
        {searchQuery ? (
          <div className="space-y-1">
            {searchFiles(searchQuery).map((result) => (
              <div key={result.path} onClick={() => setActiveFile(result.path)} className="flex items-center py-1 px-2 hover:bg-gray-800/50 cursor-pointer rounded">
                <Folder className="w-4 h-4 text-yellow-500/70" />
                <span className="text-sm ml-2 truncate">{result.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
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
                    onContextMenu={(e) => handleContextMenu(e, file.path)}
                    isRenaming={renamingPath === file.path}
                    renamingName={renamingName}
                    onRenameSubmit={handleRenameSubmit}
                    onRenameCancel={handleRenameCancel}
                    onRenameInputChange={setRenamingName}
                    renameInputRef={renameInputRef as React.RefObject<HTMLInputElement>}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {contextMenu && (
        <div className="fixed z-50 bg-gray-800 border border-gray-700 rounded shadow-lg py-1 min-w-[160px]" style={{ left: contextMenu.x, top: contextMenu.y }}>
          <button onClick={() => { handleRenameStart(contextMenu.path, contextMenu.path.split('/').pop() || ''); setContextMenu(null); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"><Edit2 className="w-3 h-3" /> Rename</button>
          <button onClick={() => { handleDuplicate(contextMenu.path); setContextMenu(null); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2"><Copy className="w-3 h-3" /> Duplicate</button>
          <button onClick={() => { handleDelete(contextMenu.path, 'file'); setContextMenu(null); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2 text-red-400"><Trash2 className="w-3 h-3" /> Delete</button>
        </div>
      )}
    </div>
  );
}
